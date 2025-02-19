import React, { useEffect, useRef, useState } from "react";
import Form from "./Form";
import Message from "./Message";
import Loading from "./Loading";

type MessageType = {
  _id?: string;
  isUserSender: boolean;
  content: string;
};

const Chat = ({ model }: { model: any }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const sendMessageHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const prompt = formData.get("prompt") as string | null;
    target.reset();

    if (!prompt) throw new Error("Prompt is required");

    setMessages((pre: MessageType[]) => {
      return [...pre, { content: prompt, isUserSender: true }];
    });

    setIsLoading(true);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    result.response;

    setMessages((pre: MessageType[]) => {
      return [...pre, { content: text, isUserSender: false }];
    });

    setIsLoading(false);
  };

  useEffect(() => {
    messagesContainerRef?.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div
      ref={messagesContainerRef}
      className=" absolute right-0 z-50 border border-gray-400  bg-white h-screen  max-h-[450px] w-[80vw] max-w-[350px] overflow-auto rounded-lg top-[-460px] py-4 flex flex-col gap-1"
    >
      <div className="px-3 py-3 text-black grow">
        {messages?.map((message) => {
          return (
            <Message
              key={message._id}
              isUserSender={message.isUserSender}
              content={message.content}
            />
          );
        })}
        {isLoading ? (
          <Loading className="!w-[50px] mt-5 ml-5 !h-[50px] relative" />
        ) : null}
      </div>
      <Form
        onSubmit={sendMessageHandler}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey === true) {
            e.currentTarget.requestSubmit();
          }
        }}
        className={"w-full px-4 py-0 "}
      >
        <Form.Textarea
          name="prompt"
          placeholder="enter your prompt"
          className="w-full h-32"
        />
      </Form>
    </div>
  );
};

export default Chat;
