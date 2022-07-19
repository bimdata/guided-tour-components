/**
 * Parameters
 */

// Tooltip gap (in px)
const tooltipGap = 40;

/**
 * Internal utility functions
 */

function getElementCoord(elem) {
  let x, y, w, h;

  if (Array.isArray(elem)) {
    let widestXW, highestYH;

    elem.map(e => {
      const { x: currentX, y: currentY, width: currentW, height: currentH } = e.getBoundingClientRect();

      if (!widestXW || widestXW < currentX + currentW) {
        widestXW = currentX + currentW;
      }

      if (!highestYH || highestYH < currentY + currentH) {
        highestYH = currentY + currentH;
      }

      if (!x || x > currentX) {
        x = currentX;
      }

      if (!y || y > currentY) {
        y = currentY;
      }

      w = widestXW - x;
      h = highestYH - y;
    });
  } else {
    const { x: currentX, y: currentY, width: currentW, height: currentH } = elem.getBoundingClientRect();

    x = currentX;
    y = currentY;
    w = currentW;
    h = currentH;
  }

  return { x, y, w, h };
}

function getWindowSize() {
  return {
    wWindow: window.innerWidth,
    hWindow: window.innerHeight,
  };
}

function getWindowScroll() {
  return {
    offsetXWindow: window.pageXOffset,
    offsetYWindow: window.pageYOffset,
  };
}

/**
 * Exported utility functions
 */

function isNegative(num) {
  return Math.sign(num) === -1;
}

async function scrollToTarget(target, element) {
  const { y, h } = getElementCoord(target);
  const { hWindow } = getWindowSize();

  const offsetYElement = element.offsetTop;
  const scrolledTop = element.scrollTop;

  if (isNegative(y)) {
    element.scroll({
      top: scrolledTop + y - tooltipGap,
    });
  }

  if (y < offsetYElement) {
    element.scroll({
      top: scrolledTop + y - offsetYElement - tooltipGap,
    });
  }

  if (y + h > hWindow) {
    element.scroll({
      top: y + h - hWindow + scrolledTop + tooltipGap,
    });
  }
}

function setArrow(arrow, position) {
  const style = {
    content: '',
    margin: 'auto',
    position: 'absolute',
    width: '25px',
    height: '25px',
    transform: 'rotate(45deg)',
    boxShadow: '5px 3px 0.9em, 0 0 rgba(0,0,0,0.5)',
  };

  if (position === 'bottom') {
    Object.assign(arrow.style, {
      ...style,
      left: 0,
      right: 0,
      bottom: 'calc(100% - 12px)',
      backgroundColor: 'var(--color-silver-light)',
    });
  } else if (position === 'top') {
    Object.assign(arrow.style, {
      ...style,
      left: 0,
      right: 0,
      bottom: '-12px',
      backgroundColor: 'var(--color-white)',
    });
  } else if (position === 'sup-left') {
    Object.assign(arrow.style, {
      ...style,
      right: '-12px',
      top: '-176px',
      bottom: 0,
      backgroundColor: 'var(--color-silver-light)',
    });
  } else if (position === 'sup-right') {
    console.log('dans le suppRight');
    Object.assign(arrow.style, {
      ...style,
      left: '-12px',
      top: '-176px',
      bottom: 0,
      backgroundColor: 'var(--color-silver-light)',
    });
  } else if (position === 'down-left') {
    Object.assign(arrow.style, {
      ...style,
      right: '-12px',
      top: '150px',
      bottom: '0px',
      backgroundColor: 'var(--color-white)',
    });
  } else if (position === 'down-right') {
    Object.assign(arrow.style, {
      ...style,
      left: '-12px',
      top: '150px',
      bottom: '0px',
      backgroundColor: 'var(--color-white)',
    });
  }
}

function setTooltipPosition(target, tooltip, arrow, yOffset = 0, xOffset = 0) {
  const { x: xTarget, y: yTarget, w: wTarget, h: hTarget } = getElementCoord(target);

  const { w: wToolTip, h: hTooltip } = getElementCoord(tooltip);
  const { wWindow, hWindow } = getWindowSize();
  const { offsetXWindow, offsetYWindow } = getWindowScroll();

  let left, top;

  const leftTarget = offsetXWindow + xTarget;
  const wideTooltip = wToolTip + tooltipGap;

  const topTarget = offsetYWindow + yTarget;
  const highTooltip = hTooltip + tooltipGap;

  const tooltipFitRight = wWindow - (leftTarget + wTarget) > wideTooltip;
  const tooltipFitLeft = leftTarget > wideTooltip;

  if (tooltipFitRight) {
    left = leftTarget + wTarget + tooltipGap;

    // align bottom
    if (hWindow - topTarget - hTarget < highTooltip - hTarget) {
      top = topTarget + hTarget - hTooltip;
      setArrow(arrow, 'down-right');
      // align top
    } else {
      top = topTarget;
      setArrow(arrow, 'sup-right');
    }

    Object.assign(tooltip.style, {
      left: `${left + xOffset}px`,
      top: `${top + yOffset}px`,
    });
    return;
  }

  if (tooltipFitLeft) {
    left = leftTarget - wideTooltip;

    // align bottom
    if (hWindow - topTarget - hTarget < highTooltip - hTarget) {
      top = topTarget + hTarget - hTooltip;
      setArrow(arrow, 'down-left');
      // align top
    } else {
      top = topTarget;
      setArrow(arrow, 'sup-left');
    }
    Object.assign(tooltip.style, {
      left: `${left + xOffset}px`,
      top: `${top + yOffset}px`,
    });
    return;
  }

  const tooltipFitTop = highTooltip < topTarget - tooltipGap;
  const tooltipFitBottom = hWindow - (topTarget + hTarget) > highTooltip;

  if (tooltipFitTop) {
    setArrow(arrow, 'top');
    Object.assign(tooltip.style, {
      left: `${leftTarget + xOffset}px`,
      top: `${topTarget - highTooltip + yOffset}px`,
    });
    return;
  }

  if (tooltipFitBottom) {
    setArrow(arrow, 'bottom');
    Object.assign(tooltip.style, {
      left: `${leftTarget + xOffset}px`,
      top: `${topTarget + hTarget + tooltipGap + yOffset}px`,
    });
    return;
  }

  // tooltip in element
  Object.assign(tooltip.style, {
    left: `${leftTarget + wTarget - wToolTip + xOffset}px`,
    top: `${topTarget + hTarget - hTooltip + yOffset}px`,
  });
}

export { scrollToTarget, setTooltipPosition };
