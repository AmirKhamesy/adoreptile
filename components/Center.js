import styled from "styled-components";

const StyledDiv = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  @media screen and (max-width: 768px) {
    padding: 0 16px;
  }
`;

export default function Center({ children }) {
  return <StyledDiv>{children}</StyledDiv>;
}
