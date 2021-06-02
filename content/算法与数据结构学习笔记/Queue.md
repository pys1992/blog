```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#define CPA 6

struct Queue
{
    int p[CPA];
    int front;
    int rear;
};

void in(struct Queue *queue, int data);
int out(struct Queue *queue);
void list(struct Queue *queue);
_Bool isFull(struct Queue *queue);
_Bool isEmpty(struct Queue *queue);

int main(void)
{
    struct Queue *queue;
    queue->front = 0;
    queue->rear = 0;
    in(queue, 1);
    in(queue, 2);
    in(queue, 3);
    in(queue, 4);
    in(queue, 5);
    out(queue);
    out(queue);
    out(queue);
    out(queue);
    out(queue);
    out(queue); // 队列空了
    list(queue);
    return 0;
}

void in(struct Queue *queue, int data)
{
    if (isFull(queue)) {
        printf("队列满了\n");
        exit(-1);
    }

    queue->p[queue->rear] = data;
    queue->rear = (queue->rear + 1) % CPA;
}

int out(struct Queue *queue)
{
    if (isEmpty(queue)) {
        printf("队列空了\n");
        exit(-1);
    }
    int data = queue->p[queue->front + 1];
    queue->front = (queue->front + 1) % CPA;
    return data;
}

void list(struct Queue *queue)
{
    int tmp = queue->front;

    while (tmp != queue->rear) {
        printf("%d\n", queue->p[tmp]);
        tmp = (tmp + 1) % CPA;
    }
}

_Bool isFull(struct Queue *queue)
{
    return (queue->rear + 1) % CPA == queue->front;
}

_Bool isEmpty(struct Queue *queue)
{
    return queue->rear == queue->front;
}

```

