```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

struct Node
{
  int data;
  struct Node *next;
  struct Node *prev;
};

struct Node *newNode(int data);
struct Node *newEmptyNode();
void append(struct Node *head, int data);
void list(struct Node *head);
void listReverse(struct Node *head);
void insert(struct Node *head, int data, int index);
int del(struct Node *head, int index);

int main()
{
  struct Node *head = newEmptyNode();

  append(head, 11);
  append(head, 33);
  append(head, 44);
  append(head, 55);

  list(head);

  insert(head, 22, 2);
  // insert(head, 66, 6);
  list(head);

  del(head, 2);
  list(head);

  return 0;
}

struct Node *newNode(int data)
{
  struct Node *node = (struct Node *)malloc(sizeof(struct Node));
  node->data = data;
  node->next = NULL;
  node->prev = NULL;

  return node;
}

struct Node *newEmptyNode()
{
  return newNode(0);
}

void append(struct Node *head, int data)
{
  struct Node *node = newNode(data);

  struct Node *temp = head;

  while (temp->next != NULL) {
      temp = temp->next;
  }

  temp->next = node;
  node->prev = temp;
}

void list(struct Node *head)
{
  struct Node *temp = head;

  while (temp->next != NULL) {
      printf("(%p)[%p|%d|%p]\n", temp->next, temp->next->prev,
             temp->next->data, temp->next->next);
      temp = temp->next;
  }

  printf("\n");
}

void insert(struct Node *head, int data, int index)
{
  if (index <= 0) {
      printf("index 不合法\n");
      exit(-1);
  }

  struct Node *node = newNode(data);

  struct Node *temp = head;
  int i = 1;

  while (temp != NULL) {
      if (i == index) {
          break;
      }

      temp = temp->next;

      i++;
  }

  printf("%d\n", i);
  printf("%p\n", temp);

  if (temp == NULL) {
      printf("index 不合法\n");
      exit(-1);
  }

  // 这里想不明白，可以看下面的示意图
  node->next = temp->next;
  temp->next = node;

  node->next->prev = node;
  node->prev = temp;
}

int del(struct Node *head, int index)
{
  if (index <= 0) {
      printf("index 不合法\n");
      exit(-1);
  }

  struct Node *temp = head->next;
  int i = 1;

  while (temp != NULL) {
      if (i == index) {
          break;
      }

      temp = temp->next;

      i++;
  }

  if (temp == NULL) {
      printf("index 不合法\n");
      exit(-1);
  }

  printf("%p\n", temp);

  // 此时的 temp 保存的就是要删除的节点的地址
  int data = temp->data;

  temp->prev->next = temp->next;

  // 判断删除的是否是最后一个节点
  if (temp->next != NULL) {
      temp->next->prev = temp->prev;
  }

  free(temp);

  return data;
}
```

## 约瑟夫环

```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

struct Node
{
  int data;
  struct Node *next;
};

struct Node *newNode(int data);
struct Node *buildJoseph(int number);
void list(struct Node *node);
void solution(struct Node *last, int startIndex, int offset);

int main(void)
{
  // 约瑟夫环的最后一个节点
  struct Node *last = buildJoseph(10);

  list(last->next);

  solution(last, 1, 3);

  return 0;
}

struct Node *newNode(int data)
{
  struct Node *node = (struct Node *)malloc(sizeof(struct Node));
  node->next = NULL;
  node->data = data;
  return node;
}

struct Node *buildJoseph(int number)
{

  struct Node *first = newNode(1);

  struct Node *temp = first;

  for (int i = 1; i < number; i++) {
      struct Node *node = newNode(i + 1);

      temp->next = node;

      temp = node;
  }

  temp->next = first;

  return temp;
}

void list(struct Node *first)
{
  struct Node *temp = first;

  while (true) {
      printf("(%p)[%d|%p]\n", temp, temp->data, temp->next);
      temp = temp->next;

      if (temp == first) {
          break;
      }
  }

  printf("\n");
}

void solution(struct Node *last, int startIndex, int offset)
{
  struct Node *first = last->next;
  struct Node *tail = last;
  struct Node *deletedNode;

  for (int i = 0; i < startIndex - 1; i++) {
      first = first->next;
      tail = tail->next;
  }

  while (tail != first) {
      for (int i = 0; i < offset - 1; i++) {
          first = first->next;
          tail = tail->next;
      }
      deletedNode = first;
      first = deletedNode->next;
      tail->next = first;
      printf("%d ", deletedNode->data);
      free(deletedNode);
  }
  printf("\n");
  printf("最后剩下的节点是%d\n", first->data);
}
```

