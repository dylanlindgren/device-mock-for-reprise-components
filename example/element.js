import { createCustomElement } from '@servicenow/ui-core';
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import '../src/index.js';

const view = (state, { updateState }) => {


    const props = {
        height: 2779,
        width: 1286,
        offsetY: 200,
        offsetX: 200,
        cropRadius: 159,
        drawEnabled: true,
        elements: [],
        deviceImage: "/sys_attachment.do?sys_id=fa23d21ac39b291072397fef050131c1",
        url: "/sys_attachment.do?sys_id=6106561e873431108da155373cbb35eb",
        type: "screenshot",
        // maxWidth: 500,
        // maxHeight: 500
    };

    // const props = {
    //     height: 1668,
    //     width: 2388,
    //     offsetY: 100,
    //     offsetX: 100,
    //     cropRadius: 30,
    //     drawEnabled: true,
    //     elements: [],
    //     deviceImage: "https://dl.service-now.com/sys_attachment.do?sys_id=0b04b8cf93943110b676b28d1dba1098",
    //     url: "http://www.example.com",
    //     type: "iframe"
    // };

    return (
        <div>
            <snc-wds-mmc-device
                height={props.height}
                width={props.width}
                offset-x={props.offsetX}
                offset-y={props.offsetY}
                crop-radius={props.cropRadius}
                draw-enabled={props.drawEnabled}
                elements={props.elements}
                device-image={props.deviceImage}
                url={props.url}
                type={props.type}
                max-width={props.maxWidth}
                max-height={props.maxHeight}/>
        </div>
    )
};

createCustomElement('snc-wds-mobile-mock-components-examples', {
    renderer: { type: snabbdom },
    view
});

const el = document.createElement('DIV');
el.innerHTML = `<snc-wds-mobile-mock-components-examples/>`;
document.body.appendChild(el);