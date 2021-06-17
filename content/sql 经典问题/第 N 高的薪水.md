## 题目

假设有一个 employee 表，如下：

| salary | ranking | @prevSalary := salary |
| ------ | ------- | --------------------- |
| 600    | 1       | 600                   |
| 500    | 2       | 500                   |
| 300    | 3       | 300                   |
| 300    | 3       | 300                   |
| 200    | 4       | 200                   |
| 100    | 5       | 100                   |

请查询出第 N 高的工资。

示例：如果 N 等于 1，则结果应该是 600；如果 N 等于 3，则结果应该是 300；如果 N 等于 4，则结果应该是 200，即重复的工资只计算一次。

## 解答

### 方法一 使用 limit

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
LIMIT 3, -- N-1
1
```

### 方法二 使用子查询

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
		e2.salary > e1.salary) = 3 -- N-1
```

这里的子查询相当于在表的后面增加了一列，记录有多少个不重复的工资比“我”高。如下表所示：

| id   | salary | count |
| ---- | ------ | ----- |
| 1    | 100    | 4     |
| 2    | 200    | 3     |
| 3    | 300    | 2     |
| 4    | 300    | 2     |
| 5    | 500    | 1     |
| 6    | 600    | 0     |

例如针对 100 来说，有 200、300、500、600 比 100 高，所以对应的 count 是 4，那么意味着 100 的排名是 4 - 1 = 3。

### 方法三 使用 join

假设 N = 4

#### 分析自连接得到的数据

```sql
SELECT
	*
FROM
	employee e1
	JOIN employee e2 ON e1.salary < e2.salary
ORDER BY
	e1.salary
```

得到如下数据：

| id   | salary | id   | salary |
| ---- | ------ | ---- | ------ |
| 1    | 100    | 2    | 200    |
| 1    | 100    | 3    | 300    |
| 1    | 100    | 4    | 300    |
| 1    | 100    | 5    | 500    |
| 1    | 100    | 6    | 600    |
| 2    | 200    | 3    | 300    |
| 2    | 200    | 4    | 300    |
| 2    | 200    | 5    | 500    |
| 2    | 200    | 6    | 600    |
| 4    | 300    | 5    | 500    |
| 3    | 300    | 5    | 500    |
| 4    | 300    | 6    | 600    |
| 3    | 300    | 6    | 600    |
| 5    | 500    | 6    | 600    |

接下来的思路是 e1.salary 进行分组，统计有几个 e2.*

#### 分组

```sql
SELECT
	e1.salary,
	count(DISTINCT e2.salary) count_e2
FROM
	employee e1
	JOIN employee e2 ON e1.salary < e2.salary
GROUP BY
	e1.salary
ORDER BY
	e1.salary
```

得到以下数据：

| salary | count_e2 |
| ------ | -------- |
| 100    | 4        |
| 200    | 3        |
| 300    | 2        |
| 500    | 1        |

以 200 为例，count_e2 为 3 意味着有 3 个比 200 大的工资，换句话说 200 排名第 4。要注意，这里的 `count(DISTINCT e2.salary) count_e2`，因为我们不需要重复的，所以用了 DISTINCT 去重。

最后一步，使用 having 筛选出想要的结果即可。

#### 使用 having 筛选结果

```sql
SELECT
	e1.salary
FROM
	employee e1
	JOIN employee e2 ON e1.salary < e2.salary
GROUP BY
	e1.salary
HAVING
	count(DISTINCT e2.salary) = 3 -- N-1
```

## 方法四 使用笛卡尔积

和使用 join 的方法差不多，只不过把两个表的有条件 join，改成了笛卡尔积。就不赘述了。

```sql
SELECT
	e1.salary
FROM
	employee e1,
	employee e2
WHERE
	e1.salary < e2.salary
GROUP BY
	e1.salary
HAVING
	count(DISTINCT e2.salary) = 3 -- N-1
```

## 方法五 

#### 先使用变量得到排名

```sql
SELECT
	salary,
	@ranking := IF(@prevSalary = salary, @ranking, @ranking + 1) ranking,
		@prevSalary := salary
	FROM
		employee,
		(
		SELECT
			@ranking := 0,
			@prevSalary := NULL) tmp
	ORDER BY
		salary DESC
```

得到如下数据：

| salary | ranking | @prevSalary := salary |
| ------ | ------- | --------------------- |
| 100    | 1       | 100                   |
| 200    | 2       | 200                   |
| 300    | 3       | 300                   |
| 300    | 3       | 300                   |
| 500    | 4       | 500                   |
| 600    | 5       | 600                   |

重点关注 ranking 列。可以看到，已经得到排名了，下一步筛选出想要的数据即可。

#### 筛选数据

```sql
SELECT
	salary
FROM (
	SELECT
		salary,
		@ranking := IF(@prevSalary = salary, @ranking, @ranking + 1) ranking,
			@prevSalary := salary
		FROM
			employee,
			(
			SELECT
				@ranking := 0,
				@prevSalary := NULL) tmp
		ORDER BY
			salary DESC) AS subTable
WHERE
	ranking = 4
```

## 方法六 窗口函数

MySQL 8.0 内置了许多[窗口函数](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html)，我们这里要使用的是 [DENSE_RANK()](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_dense-rank)。

#### 使用 DENSE_RANK() 得到排名

```sql
SELECT
	salary,
	DENSE_RANK() OVER (ORDER BY salary DESC)
FROM
	employee
```

得到如下数据：

| salary | ranking |
| ------ | ------- |
| 600    | 1       |
| 500    | 2       |
| 300    | 3       |
| 300    | 3       |
| 200    | 4       |
| 100    | 5       |

#### 筛选数据

筛选数据的方法和方法五一样，就不赘述了。

