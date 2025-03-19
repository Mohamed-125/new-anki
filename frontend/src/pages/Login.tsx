import Form from "../components/Form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import { useForm } from "react-hook-form";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { AuthFormSchema, AuthFormSchemaType } from "@/utils/AuthFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import useGetCurrentUser, { UserType } from "@/hooks/useGetCurrentUser";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedLearningLanguage } = useGetCurrentUser();

  const onSubmit = (values: AuthFormSchemaType) => {
    console.log(values);
    let data = values;
    axios
      .post("auth/login", data)
      .then((res) => {
        queryClient.setQueryData(["me"], () => {
          return res.data;
        });
        console.log(res.data as UserType);
        setSelectedLearningLanguage(res.data?.languages?.[0]);

        navigate("/");
      })
      .catch((err) => err);
  };

  return (
    <div className="flex flex-grow justify-center items-center">
      <Form
        onSubmit={handleSubmit((values) => onSubmit(values))}
        className="p-8 w-full max-w-md bg-white rounded-xl shadow-lg"
      >
        <Form.Title className="mb-6 text-2xl font-bold text-center">
          {" "}
          Login{" "}
        </Form.Title>
        <Form.FieldsContainer gap={12} className="space-y-4">
          <Form.Field>
            <Form.Label className="font-medium">Email</Form.Label>
            <Form.Input
              placeholder="JohnDeo@gmail.com"
              type="text"
              autoComplete="nope"
              {...register("email")}
            />
            <Form.Message error={true} className="text-sm">
              {errors.email?.message}
            </Form.Message>
          </Form.Field>
          <Form.Field>
            <Form.Label className="font-medium">Password</Form.Label>
            <Form.Input
              placeholder="Enter your password"
              type="password"
              autoComplete="nope"
              {...register("password")}
            />
            <Form.Message error={true} className="text-sm">
              {errors.password?.message}
            </Form.Message>
          </Form.Field>
        </Form.FieldsContainer>

        <Form.Message
          center={true}
          className="mt-4 text-primary hover:underline"
        >
          <Link to={"/forgot-password"}> Forgot password ?</Link>{" "}
        </Form.Message>

        <Button
          size="parent"
          className="py-2 mt-6 w-full text-white rounded-md transition-colors bg-primary hover:bg-primary/90"
        >
          Submit
        </Button>
        <div className="relative my-4">
          <div className="flex absolute inset-0 items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="flex relative justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">Or</span>
          </div>
        </div>
        <GoogleAuthButton />
        <Form.Message center={true} className="mt-4">
          You don't have an account?{" "}
          <Link to={"/register"}>
            <span className="text-primary hover:underline">
              Create one Now!
            </span>
          </Link>
        </Form.Message>
      </Form>
    </div>
  );
};

export default Login;
