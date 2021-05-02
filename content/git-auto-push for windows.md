> logseq 官方维护了一个 [git-auto](https://github.com/logseq/git-auto)，有丰富的配置，开箱即用。而我这个则比较简陋，不支持丰富配置，但是比较容易看懂。如果不需要复杂的功能，我这个办法也挺香的。

## 安装git

首先需要在电脑上安装好 git，[下载地址](http://git-scm.com/download/win)。

然后在安装目录里找到 `git.exe` 文件。如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228183844.png)

右键查看其属性，找到其路径备用。如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228185509.png)

## bat脚本
在任意位置新建一个文件 `AutoPush.bat`，名字也是任意的，写入以下内容：
```bash
@echo off

@REM 进入到项目目录
cd "C:\xxx\xxx"

@REM git 目录
set GIT_PATH="D:\App\Git\cmd\git.exe"

@REM 设置分支
set BRANCH = "origin"

@REM 循环标记
:loop 

@REM add 命令
%GIT_PATH% add -A

@REM commit 命令
%GIT_PATH% commit -m "auto commit"

@REM pull 命令，如果不需要每次 push 之前都 pull ，可以把这个删除
%GIT_PATH% pull %BRANCH%

@REM push 命令
%GIT_PATH% push %BRANCH%

@REM 等待 180 秒
timeout 180 > NUL

@REM 回到 loop 标记处
goto loop
```

至此，这个文件已经可以使用了，双击即可使用。如果想在后台自动运行，可以继续往下看。

## 后台自动运行脚本

### 后台执行脚本
上面的 bat 脚本在运行的时候，会弹出 cmd 窗口，为了让其静默执行，我们需要另一个脚本来调用它，任意位置新建 `AutoPushDaemon.VBS`，写入以下内容：

```vb
Set WshShell = CreateObject("WScript.Shell") 
WshShell.Run chr(34) & "C:\AutoPushNote.bat" & Chr(34), 0
Set WshShell = Nothing
```

注意上面的 `C:\AutoPushNote.bat`，替换为你自己的路径。

### 部署计划任务
搜索 task ，找到任务计划程序。如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228184723.png)

新建任务，如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228185420.png)

名称和描述随意填写，如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228185357.png)

触发器，这里为了每次开机都能运行，选择"计算机启动时"，如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228212248.png)

选择启动程序，如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228185927.png)

填写需要运行的脚本的完整路径，即上面新建的 `AutoPushDaemon.VBS`。如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228190134.png)

最后保存。

首次运行需要手动操作，如图：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210228190332.png)