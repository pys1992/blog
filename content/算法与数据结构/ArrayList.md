用数组实现线性表比较简单，记录一下代码即可。
```c
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

struct ArrayList {
    int *p;
    int cpa;
    int len;
};

void init(struct ArrayList *arrayList, int cap);
void list(struct ArrayList *arrayList);
_Bool isFull(struct ArrayList *arrayList);
_Bool isEmpty(struct ArrayList *arrayList);
void append(struct ArrayList *arrayList, int data);
void insert(struct ArrayList *arrayList, int data, int index);
int delete(struct ArrayList *arrayList, int index);
void reverse(struct ArrayList *arrayList);

int main(void)
{
    struct ArrayList arrayList;
    init(&arrayList, 6);
    append(&arrayList, 88);
    append(&arrayList, -1);
    append(&arrayList, -44);
    append(&arrayList, 2);
    append(&arrayList, 23);
    // insert(&arrayList, 155, 2);
    // delete (&arrayList, 1);
    // reverse(&arrayList);
    list(&arrayList);
    return 0;
}

void init(struct ArrayList *arrayList, int cap)
{
    arrayList->p = (int *)malloc(sizeof(int) * cap);
    arrayList->cpa = cap;
    arrayList->len = 0;
}

void list(struct ArrayList *arrayList)
{
    for (int i = 0; i < arrayList->len; i++) {
        printf("%d\n", arrayList->p[i]);
    }
    printf("输出完成，共有%d个元素\n", arrayList->len);
}

_Bool isFull(struct ArrayList *arrayList)
{
    return arrayList->len == arrayList->cpa;
}

_Bool isEmpty(struct ArrayList *arrayList)
{
    return arrayList->len == 0;
}

void append(struct ArrayList *arrayList, int data)
{
    if (isFull(arrayList)) {
        printf("插入数据失败，数组已满\n");
        exit(-1);
    }

    arrayList->p[arrayList->len] = data;
    arrayList->len++;
}

void insert(struct ArrayList *arrayList, int data, int index)
{
    if (isFull(arrayList)) {
        printf("插入数据失败，数组已满\n");
        exit(-1);
    }

    if (index < 1 || index > arrayList->len + 1) {
        printf("index 非法\n");
        exit(-1);
    }

    for (int i = arrayList->len; i >= index; i--) {
        arrayList->p[i] = arrayList->p[i - 1];
    }

    arrayList->p[index - 1] = data;
    arrayList->len++;
}

int delete(struct ArrayList *arrayList, int index)
{
    if (isEmpty(arrayList)) {
        printf("删除数据失败，数组是空的\n");
        exit(-1);
    }

    if (index < 1 || index > arrayList->len) {
        printf("index 非法\n");
        exit(-1);
    }

    int data = arrayList->p[index - 1];

    for (int i = index; i < arrayList->len; i++) {
        arrayList->p[i - 1] = arrayList->p[i];
    }

    arrayList->len--;

    return data;
}

void reverse(struct ArrayList *arrayList)
{
    int i = 0;
    int j = arrayList->len - 1;

    while (i < j) {
        int temp = arrayList->p[i];
        int temp = arrayList->p[i];
        arrayList->p[i] = arrayList->p[j];
        arrayList->p[j] = temp;
        i++;
        j--;
    }
}
```

