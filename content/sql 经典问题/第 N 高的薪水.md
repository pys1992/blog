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

示例：如果 N 等于 1，则结果应该是 600；如果 N 等于 3，则结果应该是 300；如果 N 等于 4，则结果应该是 200，即重复的工资只计算一次。

## 解答

### 使用 limit

假设 N = 4

```sql
SELECT
	salary
FROM
	employee
GROUP BY
	salary
ORDER BY
	salary DESC
LIMIT 3,
1
```

### 使用子查询

假设 N = 4

```sql
SELECT DISTINCT
	e1.salary
FROM
	employee e1
WHERE (
	SELECT
		count(DISTINCT salary)
	FROM
		employee e2
	WHERE
		e2.salary > e1.salary) = 3
```

这里的子查询相当于在表的后面增加了一列，记录有多少个不重复的工资比我高。如下表所示：

| id   | salary | count |
| ---- | ------ | ----- |
| 1    | 100    | 4     |
| 2    | 200    | 3     |
| 3    | 300    | 2     |
| 4    | 300    | 2     |
| 5    | 500    | 1     |
| 6    | 600    | 0     |

例如针对 100 来说，有 200、300、500、600 比 100 高，所以对应的 count 是 4，那么意味着 100 的排名是 4 - 1 = 3。
