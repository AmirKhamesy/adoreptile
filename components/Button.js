import styled, { css } from "styled-components";
import * as colors from "@/lib/colors";

export const ButtonStyle = css`
  border: 0;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 500;
  font-size: 0.9375rem;
  letter-spacing: -0.01em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  svg {
    height: 18px;
    margin-right: 8px;
    transition: transform 0.3s ease;
  }

  &:active {
    transform: scale(0.98);
  }

  ${(props) =>
    props.block &&
    css`
      display: flex;
      width: 100%;
    `}

  ${(props) =>
    props.white &&
    !props.outline &&
    css`
      background-color: rgba(255, 255, 255, 0.9);
      color: ${colors.primary};
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      &:hover {
        background-color: rgba(255, 255, 255, 1);
      }
    `}

  ${(props) =>
    props.white &&
    props.outline &&
    css`
      background-color: transparent;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      &:hover {
        border-color: rgba(255, 255, 255, 0.9);
        background-color: rgba(255, 255, 255, 0.1);
      }
    `}

  ${(props) =>
    props.black &&
    !props.outline &&
    css`
      background-color: ${colors.textDark};
      color: #fff;

      &:hover {
        background-color: ${colors.textDark}ee;
      }
    `}

  ${(props) =>
    props.black &&
    props.outline &&
    css`
      background-color: transparent;
      color: ${colors.textDark};
      border: 1px solid ${colors.textDark}40;

      &:hover {
        border-color: ${colors.textDark};
        background-color: ${colors.textDark}08;
      }
    `}

  ${(props) =>
    props.primary &&
    !props.outline &&
    css`
      background-color: ${colors.primary};
      color: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      &:hover {
        background-color: ${colors.primaryDark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${colors.primary}40;
      }

      &:active {
        transform: translateY(0);
      }
    `}

  ${(props) =>
    props.primary &&
    props.outline &&
    css`
      background-color: ${colors.primary}10;
      color: ${colors.primary};
      border: 1px solid ${colors.primary}40;

      &:hover {
        background-color: ${colors.primary}15;
        border-color: ${colors.primary};
      }
    `}

  ${(props) =>
    props.size === "l" &&
    css`
      font-size: 1.0625rem;
      padding: 14px 28px;

      svg {
        height: 20px;
      }
    `}

  ${(props) =>
    props.size === "s" &&
    css`
      font-size: 0.875rem;
      padding: 8px 16px;

      svg {
        height: 16px;
      }
    `}

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 12px 24px;
  }
`;

const StyledButton = styled.button`
  ${ButtonStyle}
`;

export default function Button({ children, ...rest }) {
  return <StyledButton {...rest}>{children}</StyledButton>;
}
