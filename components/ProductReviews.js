import styled from "styled-components";
import Input from "@/components/Input";
import StarsRating from "@/components/StarsRating";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import * as colors from "@/lib/colors";

const ReviewsContainer = styled.div`
  background: ${colors.white};
  border-radius: 30px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  @media screen and (max-width: 768px) {
    padding: 20px;
    border-radius: 20px;
  }
`;

const Title = styled.h2`
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #1d1d1f;
  margin: 0 0 1.5rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.h3`
  font-size: 1.25rem;
  color: #1d1d1f;
  margin: 0 0 1.25rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ColsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-bottom: 40px;

  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ReviewForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f5f5f7;
  padding: 24px;
  border-radius: 20px;
`;

const StarsWrapper = styled.div`
  margin-bottom: 8px;
`;

const StyledInput = styled(Input)`
  background: ${colors.white};
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 1rem;
  color: #1d1d1f;
  transition: all 0.2s ease;

  &:focus {
    box-shadow: 0 0 0 4px ${colors.primary}22;
  }
`;

const StyledTextarea = styled(Textarea)`
  background: ${colors.white};
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 1rem;
  color: #1d1d1f;
  min-height: 120px;
  transition: all 0.2s ease;

  &:focus {
    box-shadow: 0 0 0 4px ${colors.primary}22;
  }
`;

const SubmitButton = styled(Button)`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 980px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;

  &:hover {
    background: ${colors.primary}dd;
    transform: scale(1.02);
  }
`;

const ReviewsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ReviewWrapper = styled.div`
  padding: 24px;
  background: #f5f5f7;
  border-radius: 20px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReviewTitle = styled.h3`
  font-size: 1.125rem;
  color: #1d1d1f;
  margin: 0 0 8px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ReviewDescription = styled.p`
  font-size: 1rem;
  line-height: 1.5;
  color: #424245;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ReviewDate = styled.time`
  font-size: 0.875rem;
  color: #86868b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const NoReviews = styled.p`
  text-align: center;
  color: #86868b;
  font-size: 1.125rem;
  margin: 40px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 0;
`;

export default function ProductReviews({ product }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stars, setStars] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  function submitReview() {
    const data = { title, description, stars, product: product._id };
    axios.post("/api/reviews", data).then((res) => {
      setTitle("");
      setDescription("");
      setStars(0);
      loadReviews();
    });
  }

  useEffect(() => {
    loadReviews();
  }, []);

  function loadReviews() {
    setReviewsLoading(true);
    axios.get("/api/reviews?product=" + product._id).then((res) => {
      setReviews(res.data);
      setReviewsLoading(false);
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }

  return (
    <ReviewsContainer>
      <Title>Customer Reviews</Title>
      <ColsWrapper>
        <div>
          <ReviewForm>
            <Subtitle>Write a Review</Subtitle>
            <StarsWrapper>
              <StarsRating onChange={setStars} defaultHowMany={stars} />
            </StarsWrapper>
            <StyledInput
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              placeholder="Review Title"
            />
            <StyledTextarea
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              placeholder="Share your experience with this product"
            />
            <SubmitButton onClick={submitReview}>Submit Review</SubmitButton>
          </ReviewForm>
        </div>
        <div>
          {reviewsLoading ? (
            <LoadingWrapper>
              <Spinner />
            </LoadingWrapper>
          ) : reviews.length === 0 ? (
            <NoReviews>
              No reviews yet. Be the first to review this product!
            </NoReviews>
          ) : (
            <ReviewsGrid>
              {reviews.map((review) => (
                <ReviewWrapper key={review._id}>
                  <ReviewHeader>
                    <StarsRating
                      size="sm"
                      disabled={true}
                      defaultHowMany={review.stars}
                    />
                    <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                  </ReviewHeader>
                  <ReviewTitle>{review.title}</ReviewTitle>
                  <ReviewDescription>{review.description}</ReviewDescription>
                </ReviewWrapper>
              ))}
            </ReviewsGrid>
          )}
        </div>
      </ColsWrapper>
    </ReviewsContainer>
  );
}
