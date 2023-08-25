import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';

import {
	SCREEN_LOADED
} from '../constants';

const view = (state, { dispatch }) => {

	const props = state.properties;

	return (
		<div className="iframeContainer">
			<iframe src={props.url} on-load={event => dispatch(SCREEN_LOADED, event.target)}
				className="screen"></iframe>
		</div>
	);
};

createCustomElement('snc-wds-mmc-device-iframe', {
	renderer: { type: snabbdom },
	initialState: {
		screenLoaded: false
	},
	actionHandlers: {
		[SCREEN_LOADED]: function ({ updateState }) {
			updateState({
				screenLoaded: true
			});
		}
	},
	view,
	styles,
	properties: {
		url: {
			default: null
		}
	}
});