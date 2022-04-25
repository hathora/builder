import { css } from "styled-components";

export const BaseCard = css`
  line-height: 75px;
  width: 120px;
  height: 160px;
  text-align: center;
  cursor: pointer;
  border: 2px solid white;
  display: flex;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  font-size: 3rem;

  @media (max-width: 800px) {
    width: 80px;
    height: 120px;
    font-size: 1.75rem;
  }

  color: white;
  text-shadow: 1px 2px #000000;
  box-shadow: 2px 2px 0px 0px black;
`;
