```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

struct Node
{
  int data;
  struct Node *next;
};

struct Stack
{
  struct Node *top;
  struct Node *bottom;
};

struct Node *newNode(int data);
struct Node *newEmptyNode();
void push(struct Stack *stack, int data);
void list(struct Stack *stack);
int pop(struct Stack *stack);
_Bool isEmpty(struct Stack *stack);
void clean(struct Stack *stack);

int main(void)
{
  struct Node *emptyNode = newEmptyNode();
  struct Stack stack;

  // top 和 bottom 是两个指针，初始时保存的都是 emptyNode 的地址。
  stack.top = emptyNode;
  stack.bottom = stack.top;

  push(&stack, 1);
  push(&stack, 2);
  push(&stack, 3);

  list(&stack);

  // pop(&stack);
  // pop(&stack);
  // pop(&stack);
  clean(&stack);

  list(&stack);
  return 0;
}

struct Node *newNode(int data)
{
  struct Node *node = (struct Node *)malloc(sizeof(struct Node));
  node->next = NULL;
  node->data = data;
  return node;
}

struct Node *newEmptyNode()
{
  return newNode(0);
}

void push(struct Stack *stack, int data)
{
  struct Node *node = newNode(data);

  node->next = stack->top;
  stack->top = node;
}

void list(struct Stack *stack)
{
  struct Node *temp = stack->top;
  printf("栈顶\n");
  while (temp != stack->bottom) {
      printf("(%p)[%d|%p]\n", temp->next, temp->data, temp->next->next);
      temp = temp->next;
  }
  printf("栈底\n\n");
}

int pop(struct Stack *stack)
{
  if (isEmpty(stack)) {
      printf("栈空了\n");
      exit(-1);
  }

  struct Node *popedNode = stack->top;
  int data = popedNode->data;

  stack->top = popedNode->next;

  free(popedNode);

  return data;
}

_Bool isEmpty(struct Stack *stack)
{
  return stack->top == stack->bottom;
}

void clean(struct Stack *stack)
{
  while (!isEmpty(stack)) {
      // pop(stack);
      struct Node *deletedNode = stack->top;
      stack->top = deletedNode->next;
      free(deletedNode);
  }
}
```

