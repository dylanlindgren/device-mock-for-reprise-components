export const calculateBox = function calculateBox(start, end) {
    let box = {
        top: 0,
        left: 0,
        width: 0,
        height: 0
    };

    if (start.top < end.top) {
        box.top = start.top
        box.height = end.top - start.top;
    } else {
        box.top = end.top;
        box.height = start.top - end.top;
    }

    if (start.left < end.left) {
        box.left = start.left;
        box.width = end.left - start.left;
    } else {
        box.left = end.left;
        box.width = start.left - end.left;
    }

    return box;
}