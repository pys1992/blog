自从写博客以来，一直有上传图片的需求，一开始用第三方图床，例如微博等等，其缺点是图片不属于自己，某一天可能就无法访问了。后来也折腾过腾讯、阿里的对象存储。直到后来发现可以把文件存在 github 上，再配合 jsdelivr 的 CDN，在国内访问速度也挺快。

至于上传图片的工具，用过 [iPic](https://apps.apple.com/cn/app/ipic-markdown-图床工具/id1101244278?mt=12)、[uPic](https://github.com/gee1k/uPic)、[picGo](https://molunerfinn.com/PicGo/)，其中 iPic 是付费的，他们的好处是支持不同的图床、配置方便、不需要折腾。

本着能少安装软件就不安装的原则，我写了一个 Python 脚本，配合系统自带的 Automator ，实现了把文件夹里的文件或者剪切板的图片上传到 github，甚至是微信群里的图片，也是可以上传的。

## 效果

<video src="https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430145844.mp4" autoplay preload loop controls></video>

## Python 脚本

> 我没接触过 Python，这个脚本是花了一天时间，一边看语法一边写出来的，如果有错误，敬请指正。

在电脑上新建一个 Python 文件，例如`upload-file.py`，把下面的内容复制进去。

```python
import io
import os
import re
import json
import time
import base64
import requests
import subprocess

from urllib import parse
# Pillow
from PIL import Image, ImageGrab
# PyObjC
from AppKit import NSPasteboard, NSURLPboardType

# 从剪切板获取完整的文件路径
def getPath():
    # https://developer.apple.com/documentation/appkit/nspasteboard/pasteboardtype
    pb = NSPasteboard.generalPasteboard()

    url = pb.stringForType_(NSURLPboardType)

    if url is None:
        return None
    else:
        plistBytes = url.encode("utf-8")
        pathByte = re.findall(rb'<string>file://(.+?)</string>', plistBytes)[0]
        pathUTF8 = pathByte.decode('utf-8')
        return parse.unquote(pathUTF8)

# 把数据推送到 github
def push(base64, filename):
    url = "https://api.github.com/repos/[yourGithubName]/[yourRepository]/contents/" + filename

    headers = {"Authorization": "token [yourToken]"}

    data = json.dumps({
        "message": "auto commit",
        "committer": {
            "name": "[yourName]",
            "email": "[yourEmail]"
        },
        "content": base64
    })

    response = requests.put(url=url, data=data, headers=headers)

    return response

# 从文件路径得到文件后缀
def getExtension(path):
  return os.path.splitext(path)[1]

# 用 Base64 对给定的 Bytes 进行编码
def bytesToBase64(data):
    return base64.b64encode(data).decode('utf-8')

# 拼接文件名
def getFilename(extension):
    return time.strftime("%Y%m%d%H%M%S", time.localtime()) + extension

# 处理 github 返回的响应
def handleResponse(response, filename, extension):
    if response.status_code == 201:
        url = buildUrl(filename, extension)
        copyToClipboard(url)
        icon = "✅"
    else:
        icon = "❌"

    return icon + " " + response.reason

# 处理本地文件
def handleLocalFile(path):
    with open(path, 'rb') as f:

        extension = getExtension(path)

        base64 = bytesToBase64(f.read())

        filename = getFilename(extension)

        response = push(base64, filename)

        return handleResponse(response, filename, extension)

# 处理剪切板的文件，与本地文件不同的是，剪切板的文件好像是在内存中，它并没有一个文件路径(有待研究)
def handleClipboard():
    image = ImageGrab.grabclipboard()

    if isinstance(image, Image.Image):

        buffer = io.BytesIO()

        imageFormat = "png"

        extension = "." + imageFormat

        image.save(buffer, imageFormat)

        base64 = bytesToBase64(buffer.getvalue())

        filename = getFilename(extension)

        response = push(base64, filename)

        return handleResponse(response, filename, extension)
    else:
        return "❌ 剪切板的内容不是图片"

# 把给定的字符串复制到剪切板
def copyToClipboard(data):
    p = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)

    p.stdin.write(data.encode("utf-8"))

    p.stdin.close()

    p.communicate()

# 判断是否是图片
def isImage(extension):
    return extension in [".png", ".jpeg", ".gif"]

# 按照 jsdelivr 的规则构建 url
def buildUrl(filename, extension):
    url = "https://cdn.jsdelivr.net/gh/[yourGithubName]/[yourRepository]@[theBranch]/" + filename

    if isImage(extension):
        url = markdown(url)

    return url

# 按照 markdown 语法拼接 url
def markdown(url):
    return "![](" + url + ")"

if __name__ == '__main__':
    path = getPath()

    if path is None:
        toast = handleClipboard()
    else:
        toast = handleLocalFile(path)

    print(toast)
```

## 配置项

这个 Python 脚本其中的一些个人信息没有做成可配置的，需要手动改一下，改的时候把**中括号**去掉。

- [yourGithubName]：github 的名字
- [yourRepository]：存储文件的仓库名
- [yourToken]：在[这里](https://github.com/settings/tokens/new)生成的 token，需要具有访问仓库的权限。
  - ![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430103955.png)
- [yourGithubEmail]：任意一个邮箱，通常填写的是提交人的邮箱。
- [theBranch]：想要把文件存储到哪个分支，如果没有特殊需求，通常是 master 或者 main。

## 安装 python 依赖

运行`pip3 install pyobjc`安装 [pyobjc](https://pypi.org/project/pyobjc/)。

运行`pip3 install pip install Pillow`安装 [Pillow](https://pypi.org/project/Pillow/)

- pyobjc：一个 Python 和 Object-C 之间的桥梁，使得我们可以在 Python 中使用 [AppKit](https://developer.apple.com/documentation/appkit) 提供的功能，例如访问剪切板。
- Pillow：一个 Python 的图像处理库

这两个库的功能可能重复了，pyobjc 可能也具备处理图像的功能，但是我没有深入研究。

## 在命令行运行脚本上传文件

配置好之后，这个脚本就可以使用了。使用截图工具截一张图片，然后在终端里运行`python3 /path-to-file/upload-file.py`，如果没出错，终端会返回提示信息。或者也可以在访达中复制一个已经存在的文件，然后运行脚本。

如果文件很大，上传花费的时间可能很久。另外由于 jsdelivr 的限制，好像是超过 20M 的文件，就不可以访问了。关于这一点，暂时没有好办法，只能尽可能的把图片或者文件控制在 20M 之内。

## 搭配 Automator 使用
上面的脚本已经可以使用了，但是每次跑命令行依然很麻烦，苹果电脑提供了一个叫做 Automator(自动操作) 的软件，可以帮助我们建立工作流程，我们可以借助它来帮我们跑脚本。

### 新建快速操作

打开 Automator，新建一个快速操作：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430105914.png)

### 配置开始上传提示

这一步的目的是让 AppleScript 弹出一个提示。

添加一个运行 AppleScript 脚本：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430110059.png)

在其中写上：

```
on run {input, parameters}
	display notification "⬆️ 开始上传"
	return input
end run
```

### 配置 shell 脚本

增加一个运行 Shell 脚本：

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430110418.png)

在其中写上：

```
/usr/local/bin/python3 <<EOF

把上一步中配置好的 Python 脚本复制到这里

EOF
```

其中的 `/usr/local/bin/python3 <<EOF`和 `EOF`写法是一个 Hack，如果直接选择使用 python 执行，会出现找不到 Python 第三方库的情况，所以用了这个 Hack 的办法。

![image-20210430110816518](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430112121.png)

### 配置上传结束提示

这一步的目的是显示 Python 脚本返回的字符串，方便我们判断图片是否上传成功。

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430204504.png)

新增一个运行 AppleScript 脚本，在其中写上：

```
on run {input, parameters}
	display notification input as string
	return input
end run
```

最后保存文件，到此已经配置完成。

### 设置快捷键

可以在设置中，为刚才创建的服务设置一个快捷键。

![image-20210430111422275](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210430112305.png)

