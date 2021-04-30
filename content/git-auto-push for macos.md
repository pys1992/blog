
之前在 pc 上使用 [logseq](https://github.com/logseq/logseq)，期间写了一篇博文 [git-auto-push for windows](https://blog.pys.im/杂的文/git-auto-push-for-windows/)，阐述了我如何利用 git 来备份笔记。近来主力机从 pc 变成了 macbook，同样面临着笔记备份的问题。所幸问题得以解决，记录此文，以便查阅。

## git
Mac 上自带 git，不需要额外安装，运行 `which git` 可以查看 git 的路径，这个路径一会要用。

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210427190721.png)

## 利用 launchd 创建守护进程

[launchd](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html) 可以为我们创建守护进程。

打开 `/Users/pys/Library/LaunchAgents`(LaunchAgents 中的配置会在用户登录是被执行)，新建一个文件，名字随意，例如`git-auto-push.plist`，写入一下内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>KeepAlive</key>
    <true/>

    <key>Label</key>
    <string>git-auto-push</string> <!-- 标识，保持唯一即可 -->

    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/git</string> <!-- git 的路径，上一步查看到的路径 -->
      <string>acp</string> <!-- 一个自定义的 git 的命令 -->
    </array>

    <key>WorkingDirectory</key>
    <string>/XXX/XXX/notes</string> <!-- 工作路径，设置为你的笔记的路径 -->

    <key>RunAtLoad</key>  <!-- 登录的时候启动 -->
    <true/>

    <key>StartInterval</key>
    <integer>600</integer>  <!-- 每间隔600秒执行一次 -->
  </dict>
</plist>
```

## 自定义 git 命令

由于 launchd 不能执行多条命令，所以需要自定义一个 git 命令供 launchd 调用，即上一步中提到的 `acp`。如果不想自定义命令，可能需要创建多个 launchd 任务。

打开 `~/.gitconfig`文件，没有则新建一个(新建的话可能还需要配置 email 和 name)，在末尾追加上填入：

```
[alias]
    acp = ! git add . && git commit -m \"auto commit\" && git push
```

该命令把`git add .`，`git commit -m "auto commit"`，`git push`合并为一条，这个命令是懒人专用😂。

## 执行命令

每次重启电脑，命令就会自动执行。首次执行可以手动运行`launchctl load ~/Library/LaunchAgents/git-auto-push.plist`。如果要卸载，可以运行`launchctl unload ~/Library/LaunchAgents/git-auto-push.plist`