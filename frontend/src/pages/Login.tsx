import Form from "../components/Form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { useForm } from "react-hook-form";
import { AuthFormSchema, AuthFormSchemaType } from "@/utils/AuthFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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

  const onSubmit = (values: AuthFormSchemaType) => {
    console.log(values);
    let data = values;
    axios
      .post("auth/login", data)
      .then((res) => {
        queryClient.setQueryData(["me"], () => {
          return res.data;
        });
        console.log(res.data);
        navigate("/");
      })
      .catch((err) => err);
  };

  return (
    <div className="flex items-center justify-center flex-grow">
      <Form onSubmit={handleSubmit((values) => onSubmit(values))}>
        <Form.Title> Login </Form.Title>
        <Form.FieldsContainer gap={12}>
          <Form.Field>
            <Form.Label>Email</Form.Label>
            <Form.Input
              placeholder="JohnDeo@gmail.com"
              type="text"
              {...register("email")}
            />
            <Form.Message error={true}>{errors.email?.message}</Form.Message>
          </Form.Field>
          <Form.Field>
            <Form.Label>Password</Form.Label>
            <Form.Input
              placeholder="Enter your password"
              type="password"
              {...register("password")}
            />
            <Form.Message error={true}>{errors.password?.message}</Form.Message>
          </Form.Field>
        </Form.FieldsContainer>

        <Form.Message center={true} className="text-blue-500">
          <Link to={"/forgot-password"}> Forgot password ?</Link>{" "}
        </Form.Message>

        <Button size="parent">Submit</Button>
        <Form.Message center={true}>
          <Link to={"/register"}>
            You don't have an account?{" "}
            <span className="text-blue-500">Create one Now!</span>
          </Link>
        </Form.Message>
      </Form>
    </div>
  );
};

export default Login;
