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
struct Node *newEmptyNode();
void append(struct Node *head, struct Node *node);
void list(struct Node *node);
void insert(struct Node *head, struct Node *node, int index);
int del(struct Node *head, int index);

int main(void)
{
    struct Node *head = newEmptyNode();
    struct Node *node1 = newNode(11);
    append(head, node1);

    struct Node *node2 = newNode(22);
    append(head, node2);

    struct Node *node3 = newNode(44);
    append(head, node3);

    struct Node *node4 = newNode(55);
    append(head, node4);

    struct Node *node5 = newNode(66);
    append(head, node5);

    list(head);

    struct Node *node6 = newNode(33);
    insert(head, node6, 3);
    list(head);

    // del(head, 3);
    // list(head);
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

void list(struct Node *head)
{
    struct Node *temp = head;

    while (temp->next != NULL) {
        printf("(%p)[%d|%p]\n", temp->next, temp->next->data, temp->next->next);
        temp = temp->next;
    }

    printf("\n");
}

void append(struct Node *head, struct Node *node)
{
    struct Node *temp = head;

    while (temp->next != NULL) {
        temp = temp->next;
    }

    temp->next = node;
}

void insert(struct Node *head, struct Node *node, int index)
{
    if (index <= 0) {
        printf("index 不合法\n");
        exit(-1);
    }

    struct Node *temp = head;

    int i = 1;

    // temp 是 NULL 意味着越界了2个位置了
    while (temp != NULL) {

        // i 刚好等于index(意味着找到了要插入的位置)
        // 此时退出循环，temp 刚好指向了第 index 个节点
        // temp 本身是保存的是第 index-1 个节点的地址
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

    printf("%d\n", i);
    printf("%p\n", temp->next);

    // 把 temp 的下一个节点的地址赋值给新节点的 next 域
    // 要注意 temp->next 代表的是 temp 的下一个节点
    node->next = temp->next;

    // 把新节点的地址赋值给 temp 的 next 域
    temp->next = node;
}

int del(struct Node *head, int index)
{
    if (index <= 0) {
        printf("index 不合法\n");
        exit(-1);
    }

    struct Node *temp = head;

    int i = 1;

    // temp->next 是 NULL 意味着越界了1个位置了
    while (temp->next != NULL) {
        if (i == index) {
            break;
        }

        temp = temp->next;
        i++;
    }

    if (temp->next == NULL) {
        printf("index 不合法\n");
        exit(-1);
    }

    struct Node *deletedNode = temp->next;
    int data = deletedNode->data;

    // printf("%d\n", i);
    // printf("%p\n", temp->next);

    temp->next = deletedNode->next;
    free(deletedNode);
    return data;
}
```

