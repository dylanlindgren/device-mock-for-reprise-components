import { createCustomElement, actionTypes } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import '../snc-wds-mmc-device-iframe';
import '../snc-wds-mmc-device-screenshot';

const { COMPONENT_PROPERTY_CHANGED } = actionTypes;

import {
	DEVICE_KEY_LEFT_PRESSED,
	DEVICE_KEY_RIGHT_PRESSED,
	DEVICE_KEY_ESCAPE_PRESSED,
	DEVICE_LOAD_COMPLETED,
	DEVICE_IMAGE_LOADED,
	DEVICE_ELEMENT_DELETED,
	DEVICE_ELEMENTS_UPDATED,
	SCREEN_LOADED,
	SCREEN_ELEMENTS_UPDATED,
	SCREEN_ELEMENT_DELETED
} from '../constants';

function modifyHost(host, state, properties) {

	const heightRatio = state.naturalImage.height / state.naturalImage.width;
	const widthRatio = state.naturalImage.width / state.naturalImage.height;

	if (properties.maxHeight && properties.maxWidth && properties.maxHeight !== "" && properties.maxWidth !== "") {
		if (properties.maxHeight < properties.maxWidth) {
			host.style.maxWidth = properties.maxHeight * widthRatio + "px";
			host.style.maxHeight = properties.maxHeight + "px";
		} else {
			host.style.maxHeight = properties.maxWidth * heightRatio + "px";
			host.style.maxWidth = properties.maxWidth + "px";
		}

	} else if (properties.maxHeight && properties.maxHeight !== "") {
		host.style.maxWidth = properties.maxHeight * widthRatio + "px";
		host.style.maxHeight = properties.maxHeight + "px";

	} else if (properties.maxWidth && properties.maxWidth !== "") {
		host.style.maxHeight = properties.maxWidth * heightRatio + "px";
		host.style.maxWidth = properties.maxWidth + "px";
	} else {
		host.style.maxWidth = null;
		host.style.maxHeight = null;
	}

}

const view = (state, { dispatch }) => {

	const props = state.properties;

	var screenStyles = {
		width: "calc(100% / " + state.naturalImage.width + "*" + props.width + ")",
		height: "calc(100% / " + state.naturalImage.height + "*" + props.height + ")",
		left: "calc(100% / " + state.naturalImage.width + "*" + props.offsetX + ")",
		top: "calc(100% / " + state.naturalImage.height + "*" + props.offsetY + ")",
		borderRadius: "calc(100% / " + state.naturalImage.width + "*" + props.cropRadius + ")/calc(100% / " + state.naturalImage.height + "*" + props.cropRadius + ")"
	};

	function getScreen() {
		if (props.type === "screenshot") {
			return (
				<snc-wds-mmc-device-screenshot
					style={screenStyles}
					className="screen"
					draw-enabled={props.drawEnabled}
					elements={props.elements}
					url={props.url} />
			)
		} else {
			return (<snc-wds-mmc-device-iframe
				style={screenStyles}
				className="screen"
				url={props.url} />)
		}
	}

	var device = (
		<div className="deviceContainer">
			{getScreen()}
			<img src={props.deviceImage}
				className="device"
				on-load={event => dispatch(DEVICE_IMAGE_LOADED, event.target)} />
		</div>
	)

	document.body.onkeyup = function (event) {
		switch (event.code) {
			case "ArrowRight": dispatch(DEVICE_KEY_RIGHT_PRESSED); break;
			case "ArrowLeft": dispatch(DEVICE_KEY_LEFT_PRESSED); break;
			case "Escape": dispatch(DEVICE_KEY_ESCAPE_PRESSED); break;
			default: break;
		}
	}

	return device;
};

createCustomElement('snc-wds-mmc-device', {
	renderer: { type: snabbdom },
	initialState: {
		naturalImage: {
			height: null,
			width: null
		},
		deviceImageLoaded: false,
		screenLoaded: false,
		loadCompleted: false
	},
	actionHandlers: {
		[COMPONENT_PROPERTY_CHANGED]: function ({ action: {payload}, host, state, properties }) {
			if (payload.name === 'maxWidth' || payload.name === 'maxHeight') {
				modifyHost(host, state, properties);
			}
		},
		[DEVICE_LOAD_COMPLETED]: function ({ state, host, updateState, properties }) {
			modifyHost(host, state, properties);
			updateState({
				loadCompleted: true
			});
		},
		[SCREEN_ELEMENTS_UPDATED]: function ({ state, action, dispatch }) {
			dispatch(DEVICE_ELEMENTS_UPDATED, action.payload);
		},
		[SCREEN_ELEMENT_DELETED]: function ({ state, action, dispatch }) {
			dispatch(DEVICE_ELEMENT_DELETED, action.payload);
		},
		[SCREEN_LOADED]: function ({ state, updateState, dispatch }) {
			updateState({
				screenLoaded: true
			});

			if (state.deviceImageLoaded) {
				dispatch(DEVICE_LOAD_COMPLETED);
			}
		},
		[DEVICE_IMAGE_LOADED]: function ({ state, action, updateState, dispatch }) {
			updateState({
				naturalImage: {
					height: action.payload.naturalHeight,
					width: action.payload.naturalWidth
				},
				deviceImageLoaded: true
			});

			if (state.screenLoaded) {
				dispatch(DEVICE_LOAD_COMPLETED);
			}
		}
	},
	view,
	styles,
	properties: {
		offsetX: {
			default: null
		},
		offsetY: {
			default: null
		},
		height: {
			default: null
		},
		width: {
			default: null
		},
		cropRadius: {
			default: null
		},
		deviceImage: {
			default: null
		},
		drawEnabled: {
			default: true
		},
		elements: {
			default: []
		},
		deviceOffsetTop: {
			default: 0
		},
		type: {
			default: null
		},
		url: {
			default: null
		},
		maxWidth: {
			default: null
		},
		maxHeight: {
			default: null
		}
	}
});