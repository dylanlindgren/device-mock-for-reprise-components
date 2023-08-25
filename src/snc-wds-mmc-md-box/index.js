import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import '@servicenow/now-button';

import {
	BOX_ELEMENT_DELETED,
    ELEMENT_DELETED
} from '../constants';

const view = (state) => {

    const props = state.properties;

    var boxStyle = {
        top: "calc(100% / " + props.naturalScreen.height + "*" + props.box.top + ")",
        left: "calc(100% / " + props.naturalScreen.width + "*" + props.box.left + ")",
        height: "calc(100% / " + props.naturalScreen.height + "*" + props.box.height + ")",
        width: "calc(100% / " + props.naturalScreen.width + "*" + props.box.width + ")"
    }

    return (
        <div style={boxStyle} className={"drawBox " + (props.visible ? "drawBoxColor" : 'drawBoxHiddenSelectable')}>
            {props.visible? (<now-button-iconic className="deleteBox" icon="close-fill" variant="primary" size="md"></now-button-iconic>) : null}
        </div>
    );
};

createCustomElement('snc-wds-mmc-md-box', {
    renderer: { type: snabbdom },
    view,
    styles,
    actionHandlers: {
		"NOW_BUTTON_ICONIC#CLICKED": function ({properties, dispatch}) {
			dispatch(BOX_ELEMENT_DELETED, {
                id: properties.box.id
            });
            dispatch(ELEMENT_DELETED, {
                id: 'ABC123_' + properties.box.id
            });
		}
    },
    properties: {
        visible: {
            default: true
        },
        naturalScreen: {
            default: {
                width: null,
                height: null
            }
        },
        box: {
            default: {}
        }
    }
});