import Form from "../components/Form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import useGetCurrentUser from "../hooks/useGetCurrentUser";
import { FormEvent } from "react";

const Login = () => {
  const { setUser } = useGetCurrentUser();

  const navigate = useNavigate();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    axios
      .post("auth/login", data)
      .then((res) => {
        setUser(res.data);

        console.log(res.data);
        navigate("/");
      })
      .catch((err) => err);
  };
  return (
    <div className="flex items-center justify-center flex-grow ">
      <Form onSubmit={onSubmit}>
        <Form.Title> Login </Form.Title>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Email</Form.Label>
            <Form.Input
              required
              placeholder="JohnDeo@gmail.com"
              type="text"
              name="email"
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Password</Form.Label>
            <Form.Input
              required
              placeholder="12345678"
              type="password"
              name="password"
            />
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
