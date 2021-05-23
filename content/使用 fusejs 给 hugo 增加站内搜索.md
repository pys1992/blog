## 搜索方案概述

搜索方案大体上分为前端搜索和后端搜索。

后端搜索通常使用 [elastic search](https://www.elastic.co/cn/)，这是一个很成熟的解决方案。另外，不同的语言通常会有一些小众化的解决方案，例如 php 中的 [tnt search](https://github.com/teamtnt/tntsearch)，以及[迅搜](http://www.xunsearch.com)。

后端搜索还可以使用第三方的服务，[algolia](https://www.algolia.com)就是一个很不错的选择，有免费额度，初创公司或者个人用户可以考虑。但是离我们最近的数据中心在香港，延迟是一个大问题。再者就是使用腾讯云或者阿里云提供的 elastic search 服务，但是很贵，用不起🙂，溜了溜了。

前端搜索也可以叫做 browser search 或者 offline search，总的来说就是搜索的时候不需要发请求到服务器。关于前端搜索，我所了解的，有这么几个可供选择：
* [lunrjs](https://lunrjs.com/) - js 写的一个搜索库
* [elasticlunr](http://elasticlunr.com/) - 基于 lunrjs 开发的另一个方案
* [fusejs](http://fusejs.io) -  js 写的一个搜索库，官方口号是 Fuse.js is a powerful, lightweight fuzzy-search library, with zero dependencies.

[这个网站](https://www.npmtrends.com/elasticlunr-vs-fuse.js-vs-fuzzy-vs-fuzzysearch-vs-lunr-vs-reds-vs-search-index)还有列举了另外几个不是很流行的库，可以瞄一眼。

总体上说，前端方案是轻量级的，而后端方案成熟，大而全。

## fusejs
一个轻量级的模糊搜索库。本站的搜索方案就是用 fusejs 实现的，可以点击右上角的搜索图标体验。
### 安装方式
[官网](https://fusejs.io/getting-started/installation.html)都写了。

#### npm or yarn
和其他库也没什么两样的，npm 或者 yarn 下载即可。
```js
npm install --save fuse.js
// or
yarn add fuse.js
```

#### 手动
如果不想用 npm 之类的工具，可以去[仓库](https://github.com/krisk/Fuse/blob/master/dist/fuse.min.js)里手动复制到本地来用。

#### cdn引入
传统 cdn 引入方式。
```html
<script src="https://cdn.jsdelivr.net/npm/fuse.js@6.4.6"></script>
```

#### module导入
可以使用浏览器原生支持的模块功能从外部导入。
```html
<script type="module">
import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@6.4.6/dist/fuse.esm.js'
</script>
```

#### deno
值得一提的是，如果你使用 [deno](https://deno.land/)，也可以用 deno 的方式引入。
```js
import Fuse from 'https://deno.land/x/fuse@v6.4.6/dist/fuse.esm.min.js'
```

### 基本用法

```html
<script>
    // 数据
    const data = [
        {
            "title": "hello world",
        },
        {
            "title": "你好，世界",
        }
    ];

    // 弄一个实例
    const fuse = new Fuse(data, {
        // 自定义需要搜索的字段
        keys: ["title"]
    });

    // 执行搜索
    const result = fuse.search('world');
</script>
```

## 结合 hugo 使用

* [官方给的的参考](https://gist.github.com/cmod/5410eae147e4318164258742dd053993)
* 我优化的：[search.js](https://github.com/pys1992/blog/blob/main/static/js/search.js)，[css 样式](https://github.com/pys1992/blog/blob/main/static/css/index.css#L359)以及[index.json](https://github.com/pys1992/blog/blob/main/layouts/_default/index.json)

### 总体的思想

1. hugo 生成 json 数据。
2. 搜索的时候，用 js 发请求，拿到数据。
3. 实例化 fuse，搜索。
4. 得到搜索结果后，把结果展示在页面上。

下面以官方给的代码为例，阐述一下实现步骤。

### hugo 生成 json 数据

hugo 支持自定义输出类型，[参考](https://gohugo.io/templates/output-formats#output-format-definitions)。

#### 配置

Config.toml 中增加 json 输出：

```toml
[outputs]
home = ["HTML", "RSS", "JSON"]
```

#### 定义 json 格式

layout/_default/index.json

```plain
{{- $.Scratch.Add "index" slice -}}
{{- range .Site.RegularPages -}}
    {{- $.Scratch.Add "index" (dict "title" .Title "permalink" .Permalink "content" .Plain) -}}
{{- end -}}
{{- $.Scratch.Get "index" | jsonify -}}
```

做好上面两步之后，可以通过 http(s)://youdomain.com/index.json 拿到数据了。执行 `hugo` 构建站点，在 public 文件夹中也可以看到 index.json 文件。

### 引入 fuse.js

通常来说，主题文件里有一个 themes/xxx/layouts/_default/baseof.html 的文件，把 `<script src="https://cdn.jsdelivr.net/npm/fuse.js@6.4.6"></script>` 放到这个 html 的 header 中。

### 搜索框

同样找到 themes/xxx/layouts/_default/baseof.html 文件，在 body 中放入：

```html
<div id="fastSearch">
    <input id="searchInput" tabindex="0">
    <ul id="searchResults"></ul>
</div>
```

#### 搜索框样式

新建文件 static/css/search.css ，并在  themes/xxx/layouts/_default/baseof.html 中引入：<link *rel*="stylesheet" *href*='{{ "css/search.css" | relURL }}'>。

```css
#fastSearch { 
  visibility: hidden;
  position: absolute;
  right: 0px;
  top: 0px;
  display: inline-block;
  width: 300px;
}      

#fastSearch input { 
  padding: 4px 10px;
  width: 100%;
  height: 31px;
  font-size: 1.6em;
  color: #aaa;
  font-weight: bold;
  background-color: #000;
  border-radius: 3px 3px 0px 0px;
  border: none;
  outline: none;
  text-align: left;
  display: inline-block;
}

#searchResults li { 
  list-style: none; 
  margin-left: 0em;
  background-color: #333; 
  border-bottom: 1px dotted #000;
}
  #searchResults li .title { font-size: 1.1em; margin-bottom: 10px; display: inline-block;}

#searchResults { visibility: inherit; display: inline-block; width: 320px; }
#searchResults a { text-decoration: none !important; padding: 10px; display: inline-block; }
#searchResults a:hover, a:focus { outline: 0; background-color: #666; color: #fff; }
```

### search.js

新建文件 static/js/search.js ，并在  themes/xxx/layouts/_default/baseof.html 中引入：`<script src='{{ "js/search.js" | relURL }}'></script>`。

```js
var fuse; // holds our search engine
var searchVisible = false; 
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById('searchResults'); // targets the <ul>
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput'); // input box for search
var resultsAvailable = false; // Did we get any search results?

// ==========================================
// The main keyboard event listener running the show
//
document.addEventListener('keydown', function(event) {

  // CMD-/ to show / hide Search
  if (event.metaKey && event.which === 191) {
      // Load json search index if first time invoking search
      // Means we don't load json unless searches are going to happen; keep user payload small unless needed
      if(firstRun) {
        loadSearch(); // loads our json data and builds fuse.js search index
        firstRun = false; // let's never do this again
      }

      // Toggle visibility of search box
      if (!searchVisible) {
        document.getElementById("fastSearch").style.visibility = "visible"; // show search box
        document.getElementById("searchInput").focus(); // put focus in input box so you can just start typing
        searchVisible = true; // search visible
      }
      else {
        document.getElementById("fastSearch").style.visibility = "hidden"; // hide search box
        document.activeElement.blur(); // remove focus from search box 
        searchVisible = false; // search not visible
      }
  }

  // Allow ESC (27) to close search box
  if (event.keyCode == 27) {
    if (searchVisible) {
      document.getElementById("fastSearch").style.visibility = "hidden";
      document.activeElement.blur();
      searchVisible = false;
    }
  }

  // DOWN (40) arrow
  if (event.keyCode == 40) {
    if (searchVisible && resultsAvailable) {
      console.log("down");
      event.preventDefault(); // stop window from scrolling
      if ( document.activeElement == maininput) { first.focus(); } // if the currently focused element is the main input --> focus the first <li>
      else if ( document.activeElement == last ) { last.focus(); } // if we're at the bottom, stay there
      else { document.activeElement.parentElement.nextSibling.firstElementChild.focus(); } // otherwise select the next search result
    }
  }

  // UP (38) arrow
  if (event.keyCode == 38) {
    if (searchVisible && resultsAvailable) {
      event.preventDefault(); // stop window from scrolling
      if ( document.activeElement == maininput) { maininput.focus(); } // If we're in the input box, do nothing
      else if ( document.activeElement == first) { maininput.focus(); } // If we're at the first item, go to input box
      else { document.activeElement.parentElement.previousSibling.firstElementChild.focus(); } // Otherwise, select the search result above the current active one
    }
  }
});


// ==========================================
// execute search as each character is typed
//
document.getElementById("searchInput").onkeyup = function(e) { 
  executeSearch(this.value);
}


// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
      }
    }
  };
  httpRequest.open('GET', path);
  httpRequest.send(); 
}


// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() { 
  fetchJSONFile('/index.json', function(data){

    var options = { // fuse.js options; check fuse.js website for details
      shouldSort: true,
      location: 0,
      distance: 100,
      threshold: 0.4,
      minMatchCharLength: 2,
      keys: [
        'title',
        'permalink',
        'summary'
        ]
    };
    fuse = new Fuse(data, options); // build the index from the json file
  });
}


// ==========================================
// using the index we loaded on CMD-/, run 
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {
  let results = fuse.search(term); // the actual query being run using fuse.js
  let searchitems = ''; // our results bucket

  if (results.length === 0) { // no results based on what was typed into the input box
    resultsAvailable = false;
    searchitems = '';
  } else { // build our html 
    for (let item in results.slice(0,5)) { // only show first 5 results
      searchitems = searchitems + '<li><a href="' + results[item].item.permalink + '" tabindex="0">' + '<span class="title">' + results[item].item.title + '</span><br /> <span class="sc">'+ results[item].item.section +'</span> — ' + results[item].item.date + ' — <em>' + results[item].item.desc + '</em></a></li>';
    }
    resultsAvailable = true;
  }

  document.getElementById("searchResults").innerHTML = searchitems;
  if (results.length > 0) {
    first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
    last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
  }
}
```

官方的这个例子可以使用快捷键打开搜索框，在 MacOS 上按 Command + / 或者在 Windows 上按 win + / 即可开启搜索。

