## 题目

假设有一个 employee 表，如下：

| id   | salary |
| ---- | ------ |
| 1    | 100    |
| 2    | 200    |
| 3    | 300    |
| 4    | 300    |
| 5    | 500    |
| 6    | 600    |

请查询出第 N 高的工资。

示例：如果 N 等于 2，则结果应该是 200；如果 N 等于 3，则结果应该是 300；如果 N 等于 4，则结果应该是 500，即重复的工资只计算一次。

## 解答

### limit 方法

假设 N = 4;

```sql
SELECT
	salary
FROM
	employee
GROUP BY
	salary
ORDER BY
	salary
LIMIT 3,
1
```

