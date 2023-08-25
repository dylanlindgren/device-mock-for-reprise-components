import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import { snabbdom } from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import '../snc-wds-mmc-md-box';

const { COMPONENT_CONNECTED, COMPONENT_PROPERTY_CHANGED } = actionTypes;

import {
	SCREEN_LOADED,
	SCREEN_DRAWING_STARTED,
	SCREEN_DRAWING_CONTINUED,
	SCREEN_DRAWING_ENDED,
	SCREEN_DRAWING_CANCELLED,
	SCREEN_ELEMENTS_UPDATED,
	SCREEN_ELEMENT_DELETED,
	BOX_ELEMENT_DELETED,
	SCREEN_RESIZED
} from '../constants';

import { calculateBox } from '../helpers';

const view = (state, { dispatch }) => {

	const props = state.properties;

	let drawElementsStyles = {};

	if (state.drawing) {
		drawElementsStyles.pointerEvents = "none";
	}

	function getDrawBox() {
		if (state.drawing) {
			var drawboxStyle = {
				top: "calc(100% / " + state.naturalScreen.height + "*" + state.drawBox.box.top + ")",
				left: "calc(100% / " + state.naturalScreen.width + "*" + state.drawBox.box.left + ")",
				height: "calc(100% / " + state.naturalScreen.height + "*" + state.drawBox.box.height + ")",
				width: "calc(100% / " + state.naturalScreen.width + "*" + state.drawBox.box.width + ")"
			}
			return (<div style={drawboxStyle} className="drawBox drawBoxColor"></div>)
		}
	}

	return (
		<div className="screenContainer">
			{props.drawEnabled ? (
				<div className="draw" tab-index="1"
					on-mousedown={startDraw}
					on-mouseup={endDraw}
					on-mousemove={continueDraw}
					on-mouseleave={cancelDraw}
					on-contextmenu={event => event.preventDefault()}>
					{getDrawBox()}
				</div>
			) : null}
			<div className="drawnElements" style={drawElementsStyles}>
				{state.elements.map(elem => (
					<snc-wds-mmc-md-box
						box={elem}
						naturalScreen={state.naturalScreen}
						visible={props.drawEnabled} />))}
			</div>
			<img src={props.url}
				className="screenshot"
				on-load={event => dispatch(SCREEN_LOADED, event.target)} />
		</div>
	)

	function startDraw(event) {
		if (event.button === 0) {
			dispatch(SCREEN_DRAWING_STARTED, {
				top: event.offsetY,
				left: event.offsetX
			});
		}
	}

	function continueDraw(event) {
		if (state.drawing) {
			dispatch(SCREEN_DRAWING_CONTINUED, {
				top: event.offsetY,
				left: event.offsetX
			});
		}
	}

	function endDraw(event) {
		if (state.drawing) {
			dispatch(SCREEN_DRAWING_ENDED, {
				top: event.offsetY,
				left: event.offsetX
			});
		}
	}

	function cancelDraw() {
		if (state.drawing) {
			dispatch(SCREEN_DRAWING_CANCELLED);
		}
	}
};

createCustomElement('snc-wds-mmc-device-screenshot', {
	renderer: { type: snabbdom },
	initialState: {
		clientNaturalRatio: null,
		naturalScreen: {
			height: null,
			width: null,
		},
		screenImageLoaded: false,
		drawing: false,
		drawBox: {
			start: {
				top: null,
				left: null
			},
			end: {
				top: null,
				left: null
			},
			box: {
				top: null,
				left: null,
				width: null,
				height: null
			}
		},
		elements: []
	},
	actionHandlers: {
		[COMPONENT_CONNECTED]: function ({ state: { properties }, updateState }) {
			updateState({
				elements: properties.elements
			});
		},
		[COMPONENT_PROPERTY_CHANGED]: function ({ action, updateState }) {
			if (action.payload.name === 'elements') {
				updateState({
					elements: action.payload.value
				});
			}
		},
		[SCREEN_RESIZED]: function ({ action, updateState }) {

			const clientNaturalRatio = action.payload.naturalWidth / action.payload.clientWidth;

			updateState({
				clientNaturalRatio: clientNaturalRatio,
				naturalScreen: {
					width: action.payload.naturalWidth,
					height: action.payload.naturalHeight
				}
			});

		},
		[SCREEN_LOADED]: function ({ action, updateState, dispatch }) {

			updateState({
				screenImageLoaded: true
			});

			const resizeObserver = new ResizeObserver((entries) => {
				dispatch(SCREEN_RESIZED, action.payload);
			});

			resizeObserver.observe(action.payload);
		},
		[SCREEN_DRAWING_STARTED]: function ({ action, updateState, state }) {
			const start = {
				top: action.payload.top * state.clientNaturalRatio,
				left: action.payload.left * state.clientNaturalRatio
			};

			const end = {
				top: action.payload.top * state.clientNaturalRatio,
				left: action.payload.left * state.clientNaturalRatio
			};

			updateState({
				drawBox: { start, end, box: calculateBox(start, end) },
				drawing: true
			});
		},
		[SCREEN_DRAWING_ENDED]: function ({ state, updateState, dispatch }) {

			let box = Object.assign({}, state.drawBox.box);
			box.id = crypto.randomUUID();

			updateState({
				drawing: false,
			});
			updateState({
				path: 'elements',
				value: box,
				operation: 'push'
			});

			let elements = Array.from(state.elements);
			elements.push(box);

			dispatch(SCREEN_ELEMENTS_UPDATED, {
				elements: elements
			});
		},
		[SCREEN_DRAWING_CONTINUED]: function ({ state, action, updateState }) {
			const end = {
				top: action.payload.top * state.clientNaturalRatio,
				left: action.payload.left * state.clientNaturalRatio
			};

			updateState({
				path: 'drawBox',
				value: { end, box: calculateBox(state.drawBox.start, end) },
				operation: 'merge'
			});
		},
		[SCREEN_DRAWING_CANCELLED]: function ({ updateState }) {
			updateState({
				drawing: false,
			});
		},
		[BOX_ELEMENT_DELETED]: function ({ action: { payload }, dispatch }) {
			dispatch(SCREEN_ELEMENT_DELETED, payload);
		}
	},
	view,
	styles,
	properties: {
		url: {
			default: ""
		},
		drawEnabled: {
			default: true
		},
		elements: {
			default: []
		}
	}
});