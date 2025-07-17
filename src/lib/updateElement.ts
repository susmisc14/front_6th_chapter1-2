import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager.js";
import type { VNode } from "./types.js";

export function updateElement(parent: HTMLElement, newNode: VNode, oldNode: VNode, index = 0) {
  const childNode = parent.childNodes[index] as HTMLElement;

  // 1. 노드가 삭제된 경우
  if (!newNode && oldNode) {
    if (childNode) {
      parent.removeChild(childNode);
    }
    return;
  }

  // 2. 노드가 추가된 경우
  if (newNode && !oldNode) {
    parent.appendChild(createElement(newNode));
    return;
  }

  // 3. 노드의 값이 변경된 경우
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const newTextNode = document.createTextNode(String(newNode));

      if (childNode) {
        parent.replaceChild(newTextNode, childNode);
      } else {
        parent.appendChild(newTextNode);
      }
    }

    return;
  }

  if (isObject(newNode) && isObject(oldNode)) {
    // 4. 노드의 타입이 변경된 경우
    if (newNode.type !== oldNode.type) {
      if (childNode) {
        parent.replaceChild(createElement(newNode), childNode);
      } else {
        parent.appendChild(createElement(newNode));
      }

      return;
    }

    // 5. 노드의 타입이 변경되지 않은 경우
    if (childNode) {
      updateAttributes(childNode, newNode.props, oldNode.props);

      const newChildren = newNode.children;
      const oldChildren = oldNode.children;
      const maxLength = Math.max(newChildren.length, oldChildren.length);

      for (let i = 0; i < maxLength; i++) {
        updateElement(childNode as HTMLElement, newChildren[i], oldChildren[i], i);
      }

      if (oldChildren.length > newChildren.length) {
        for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
          const extraChild = childNode.childNodes[i];
          if (extraChild) {
            childNode.removeChild(extraChild);
          }
        }
      }
    }
  }
}

// helpers
function updateAttributes(
  target: HTMLElement,
  originNewProps: Record<string, any>,
  originOldProps: Record<string, any>,
) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 이전 props의 모든 키를 순회
  for (const attr in oldProps) {
    if (attr in newProps) continue;

    // 1. 이벤트 핸들러가 삭제된 경우
    if (attr.startsWith("on") && typeof oldProps[attr] === "function") {
      const eventType = attr.toLowerCase().slice(2);
      removeEvent(target, eventType, oldProps[attr]);
    }

    // 2. className 속성이 삭제된 경우
    else if (attr === "className") {
      target.removeAttribute("class");
    }

    // 3. 그 외 속성이 삭제된 경우
    else {
      target.removeAttribute(attr);
    }
  }

  // 새 props의 모든 키를 순회
  for (const attr in newProps) {
    if (oldProps[attr] === newProps[attr]) continue;

    // 1. 이벤트 핸들러가 추가된 경우
    if (attr.startsWith("on") && typeof newProps[attr] === "function") {
      const eventType = attr.toLowerCase().slice(2);
      if (typeof oldProps[attr] === "function") {
        removeEvent(target, eventType, oldProps[attr]);
      }
      addEvent(target, eventType, newProps[attr]);
    }

    // 2. className 속성이 추가된 경우
    else if (attr === "className") {
      target.className = newProps[attr];
    }

    // 3. style 속성이 추가된 경우
    else if (attr === "style" && typeof newProps[attr] === "object") {
      Object.assign(target.style, newProps[attr]);
    }

    // 4. boolean type props가 property로 직접 업데이트되어야 한다
    else if (typeof newProps[attr] === "boolean") {
      (target as any)[attr] = newProps[attr];
    }

    // 4. 그 외 속성이 추가된 경우
    else {
      target.setAttribute(attr, newProps[attr]);
    }
  }
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value != null;
}
