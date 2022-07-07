// support jsx on deno deploy
/** @jsxImportSource https://esm.sh/react@18.2.0 */

import { Head, useData } from "aleph/react";
import {Box, Stack, Tag, Button, Flex, Input} from "@chakra-ui/react";
import { useState } from "react";

type TodoItem = {
  id: number;
  message: string;
  completed: boolean;
};

type Store = {
  todos: TodoItem[];
};

const store: Store = {
  todos: JSON.parse(window.localStorage?.getItem("todos") || "[]"),
};

export const data: Data<Store, Store> = {
  cacheTtl: 0, // no cache
  get: () => {
    return store;
  },
  put: async (req) => {
    const { message } = await req.json();
    if (typeof message === "string") {
      store.todos.push({ id: Date.now(), message, completed: false });
      window.localStorage?.setItem("todos", JSON.stringify(store.todos));
    }
    return store;
  },
  patch: async (req) => {
    const { id, message, completed } = await req.json();
    const todo = store.todos.find((todo) => todo.id === id);
    if (todo) {
      if (typeof message === "string") {
        todo.message = message;
      }
      if (typeof completed === "boolean") {
        todo.completed = completed;
      }
      window.localStorage?.setItem("todos", JSON.stringify(store.todos));
    }
    return store;
  },
  delete: async (req) => {
    const { id } = await req.json();
    if (id) {
      store.todos = store.todos.filter((todo) => todo.id !== id);
      window.localStorage?.setItem("todos", JSON.stringify(store.todos));
    }
    return store;
  },
};

export default function Todos() {
  const { data, isMutating, mutation } = useData<Store>();

  const [text, setText] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }

  const handleSubmit = async () => {
    await mutation.put(
      { message: text },
      {
        // optimistic update data without waiting for the server response
        optimisticUpdate: (data) => {
          return {
            todos: [...data.todos, { id: 0, message: text, completed: false }],
          };
        },
        // replace the data with the new data that is from the server response
        replace: true,
      }
    );
    setText("");
  };

  return (
    <Flex justify="center">
      <Box>
        <Stack spacing={4} mb={6}>
          {data.todos.map((todo) => (
            <Box key={todo.id}>
              <Box>{todo.message}</Box>
              <Tag>{todo.completed ? "completed" : "not completed"}</Tag>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={4}>
          <Input
            onChange={handleChange}
            variant="outline"
            value={text}
            placeholder="Outline"
          />
          <Button
            onClick={handleSubmit}
            colorScheme="purple"
            flexShrink={0}
            variant="solid"
          >
            Submit
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}
