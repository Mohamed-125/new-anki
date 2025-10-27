import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import useDb from "../db/useDb";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

const OfflineFallback = () => {
  const navigate = useNavigate();
  const { user } = useGetCurrentUser();
  const { getUser } = useDb(user?._id);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      setHasUser(!!user);
    };
    checkUser();
  }, [getUser]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="px-6 w-full max-w-md text-center">
        <div className="mb-8">
          <svg
            className="mx-auto w-16 h-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          No Offline Access Available
        </h2>
        <p className="mb-8 text-gray-600">
          It seems you're offline and we don't have any cached data for your
          account. Please connect to the internet to access your study materials
          and progress.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            className="w-full"
          >
            Try Again
          </Button>

          {hasUser && (
            <Button
              onClick={() => navigate("/home")}
              variant="secondary"
              className="w-full"
            >
              Go to Home Screen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;
