// import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import {
//   FormEvent,
//   useDeferredValue,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import Form from "./Form";
// import useAddModalShortcuts from "../hooks/useAddModalShortcuts";
// import Button from "./Button";
// import Modal from "./Modal";
// import useModalStates from "@/hooks/useModalsStates";
// import { TextType } from "@/pages/texts";
// import TipTapEditor from "./TipTapEditor";
// import { useNavigate } from "react-router-dom";
// import Loading from "./Loading";
// import { isActive, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { title } from "process";
// import editor from "quill/core/editor";

// const AddNewTextModal = () => {
//   const queryClient = useQueryClient();
//   const {
//     defaultValues,
//     setDefaultValues,
//     isTextModalOpen,
//     setIsTextModalOpen,
//     setEditId,
//     editId,
//   } = useModalStates();

//   const formRef = useRef<HTMLFormElement | null>(null);

//   const onAnimationEnd = () => {
//     if (isTextModalOpen) return;
//     formRef.current?.reset();
//     setContent("");
//     setTitle("");
//     setEditId("");
//   };

//   const navigate = useNavigate();

//   return (
//     <Modal
//       onAnimationEnd={onAnimationEnd}
//       setIsOpen={setIsTextModalOpen}
//       isOpen={isTextModalOpen}
//       big={true}
//       className="w-full "
//     >
//       {isLoading && <Loading />}
//       <Modal.Header
//         setIsOpen={setIsTextModalOpen}
//         title={editId ? "Edit This Text" : "Add New Text"}
//       />
//       <Form
//         className="p-0 "
//         formRef={formRef}
//         onSubmit={(e) => (editId ? updateTextHandler(e) : createTextHandler(e))}
//       >
//         <Form.FieldsContainer className="">
//           <Form.Field>
//             <Form.Label>Text Name</Form.Label>
//             <Form.Input
//               value={title}
//               type="text"
//               name="text_name"
//               onChange={(e) => setTitle(e.target.value)}
//             />
//           </Form.Field>

//           <Form.Field className={"grow"}>
//             <Form.Label>Text Content</Form.Label>
//             <TipTapEditor editor={editor} />
//           </Form.Field>
//         </Form.FieldsContainer>
//         <Modal.Footer className="flex justify-end gap-3">
//           <Button
//             size="parent"
//             className={"py-3"}
//             type="button"
//             variant={"danger"}
//             onClick={() => {
//               setIsTextModalOpen(false);
//               if (editId) {
//                 // navigate("/texts/" + editId, { replace: true });
//               } else {
//                 // navigate("/texts", { replace: true });
//               }
//             }}
//           >
//             Cancel
//           </Button>
//           <Button size="parent" className={"py-3"}>
//             {editId ? "Save Changes" : "Add Text"}
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default AddNewTextModal;
