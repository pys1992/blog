let searchCallback = async () => {
    let term = null
    let data = await fetchData();
    let blocks = data.map(page => split(page)).flat();
    let fuse = newFuse(blocks);

    document.querySelector("#searchInput").addEventListener('input', (event) => {
        term = event.target.value.trim()
        scrollSearchResultToTop()
        search()
    })

    /**
     * Scroll search result (the ul element) to top.
     */
    function scrollSearchResultToTop() {
        let searchResult = document.querySelector("#searchResults");
        searchResult.scrollTop = 0
    }

    /**
     * Fetch data.
     * Hugo can output json search indexes. See https://gohugo.io/templates/output-formats.
     */
    async function fetchData() {
        try {
            const response = await fetch('/index.json');
            return response.json()
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Split whole page content by h2 and h3.
     */
    function split(page) {
        let paths = page.fullPath.split("/").map(item => item.trim()).filter(Boolean);

        let blocks = [{
            title: paths[paths.length - 1],
            path: paths.slice(1, -1).length ? paths.slice(1, -1).join(" <span class='separator'>/</span> ") + " <span class='separator'>/</span> " : "",
            permalink: page.permalink,
            level: 1,
            paragraphs: []
        }];

        let HTMLCollection = new DOMParser().parseFromString(page.htmlString, 'text/html').querySelector("body").children;

        for (const element of HTMLCollection) {
            let block = {
                paragraphs: []
            }

            // Handle headings
            if (["H2", "H3", "H4", "H5", "H6"].includes(element.nodeName)) {
                let level = parseInt(element.nodeName.substr(1, 2))
                let parentBlock = blocks.filter(block => block.level < level).slice(-1)[0];

                block.title = element.innerText
                block.path = parentBlock.path + parentBlock.title + "<span class='separator'>＞</span>"
                block.permalink = `${page.permalink}#${element.querySelector("span.anchor").getAttribute("id")}`
                block.level = level

                blocks.push(block)
            }
            // Handle paragraphs
            else {
                let parentBlock = blocks.filter(block => block.level != null).slice(-1)[0];

                //TODO: Handle different element inner text. e.g. ul or ol or code fence
                if (element.classList.contains("highlight")) {
                    handleCodeFenceInnerText(element, parentBlock)
                } else if (["UL", "OL"].includes(element.nodeName)) {
                    handleListInnerText(element, parentBlock)
                } else {
                    handleRegularInnerText(element, parentBlock)
                }

                /**
                 * Handle code fence inner text.
                 */
                function handleCodeFenceInnerText(element, parentBlock) {
                    parentBlock.paragraphs.push(element.querySelector("code[data-lang]").innerText)
                }

                /**
                 * Handle list inner text.
                 */
                function handleListInnerText(element, parentBlock) {
                    let texts = Array.from(element.querySelectorAll("li")).flat().map((item) => item.firstChild && item.firstChild.nodeValue).filter(Boolean)

                    for (const text of texts) {
                        parentBlock.paragraphs.push(text)
                    }
                }
                /**
                 * Handle regular inner text.
                 */
                function handleRegularInnerText(element, parentBlock) {
                    parentBlock.paragraphs.push(element.innerText)
                }
            }
        }

        return blocks;
    }

    /**
     * Convert angle brackets to entity.
     * "<" to "&lt;"
     * ">" to "&gt;"
     */
    function angleBrackets2Entity(string) {
        return string.replace(/[<>]/g, function (c) {
            return { "<": "&lt;", ">": "&gt;" }[c];
        });
    }

    /**
     * Convert entity to angle brackets.
     * "&lt;" to "<" 
     * "&gt;" to ">" 
     */
    function entity2AngleBrackets(string) {
        return string.replace(/(&lt;|&gt;)/g, function (c) {
            return { "&lt;": "<", "&gt;": ">" }[c];
        });
    }

    /**
     * Get fuse instance.
     */
    function newFuse(blocks) {
        var options = {
            shouldSort: true,
            minMatchCharLength: 1,
            includeMatches: true,
            ignoreLocation: true,
            threshold: 0.4,
            keys: [
                {
                    name: "title",
                    weight: 2
                },
                {
                    name: "paragraphs",
                    weight: 1
                },
            ]
        };

        return new Fuse(blocks, options);
    }

    /**
     * Search.
     */
    function search() {
        let results = fuse.search(query());

        results = highlight(results)

        let resultsLength = results.length

        showSearchToolbar(resultsLength)

        if (resultsLength) {
            showSearchResults(results)
        } else {
            noSearchResults()
        }
    }

    /**
     * Build fuse js query
     * See https://fusejs.io/api/query.html#logical-query-operators
     */
    function query() {
        return {
            $or: [
                {
                    $and: [
                        { title: term },
                        { paragraphs: term }
                    ]
                },
                { title: term },
                { paragraphs: term }
            ]
        }
    }

    function debounce(fn, delay) {

        let timer

        return function () {
            let context = this

            let args = arguments

            clearTimeout(timer)

            timer = setTimeout(function () {
                fn.apply(context, args)
            }, delay)
        }
    }

    /**
     * Highlight search results.
     */
    function highlight(results) {
        return results
            .map(result => {
                let matches = result.matches.map(match => {
                    if (match.key == "title") {
                        var value = highlightTitle(match)
                    }

                    if (match.key == "paragraphs") {
                        var value = highlightParagraphs(match)
                    }

                    return {
                        key: match.key,
                        value: value
                    }
                })

                let title = matches
                    .filter(match => match.key == "title")
                    .map(match => match.value)
                    .join("")

                let paragraphs = matches
                    .filter(match => match.key == "paragraphs")
                    .map(match => match.value)
                    .join("")

                return {
                    path: result.item.path,
                    permalink: result.item.permalink,
                    title: title || result.item.title,
                    paragraphs: paragraphs,
                    rawTitle: result.item.title,
                    hasTitle: title != "",
                    hasParagraphs: paragraphs != ""
                }
            })
            .filter(result => result.hasTitle || result.hasParagraphs)
    }

    /**
     * Highlight title.
     */
    function highlightTitle(match) {
        return wholeHighlight(match, "highlight-title")
    }

    /**
     * Highlight paragraphs.
     */
    function highlightParagraphs(match) {
        const MAX_CHARS = 50;
        // No need split the value for short string.
        if (match.value.length <= MAX_CHARS) {
            var paragraph = wholeHighlight(match, "highlight-paragraph")
        }
        // Highlight and split for long string.
        else {
            var paragraph = splitHighlight(match, "highlight-paragraph")
        }

        return paragraph ? `<li class="search-result-paragraph">${paragraph}</li>` : ""
    }

    /**
     * Highlight without split.
     */
    function wholeHighlight(match, highlightClass) {
        let value = match.value
        return [...value]
            .map((item, index) => {
                let matched = match.indices.some(range => {
                    return index >= range[0] && index <= range[1]
                })
                return matched ? `<span class="${highlightClass}">${angleBrackets2Entity(item)}</span>` : angleBrackets2Entity(item)
            })
            .join("")
    }

    /**
     * Highlight and split by "...".
     */
    function splitHighlight(match, highlightClass) {
        let value = match.value

        return match.indices
            // low correlation match https://github.com/krisk/Fuse/issues/409#issuecomment-623160126
            .filter(range => range[1] - range[0] + 1 >= term.length - 1)
            .slice(0, 5)
            .map(range => {
                let offset = 15;

                let prefixStart = range[0] - offset <= 0 ? 0 : range[0] - offset;
                let prefix = value.slice(prefixStart, range[0]).replace(/.*\n/, "");

                let suffixEnd = range[1] + 1 + offset >= value.length ? value.length : range[1] + 1 + offset;
                let suffix = value.slice(range[1] + 1, suffixEnd).replace(/\n.*/, "");

                let highlight = value.slice(range[0], range[1] + 1)

                let punctuations = [
                    " ",
                    ".",
                    "。",
                    "!",
                    "！",
                    "？",
                    "?",
                    "\n"
                ];

                // Append "..." to start if the prefix is truncated
                if (prefixStart != 0) {
                    let startIndex = range[0] - prefix.length;
                    let beforePrefixStart = value.slice(startIndex - 1, startIndex)
                    if (!punctuations.includes(beforePrefixStart)) {
                        prefix = `...${prefix}`
                    }
                }

                // Append "..." to end if the suffix is truncated
                if (suffixEnd != value.length) {
                    let endIndex = range[1] + suffix.length;
                    let afterSuffixEnd = value.slice(endIndex, endIndex + 1)
                    if (!punctuations.includes(afterSuffixEnd)) {
                        suffix = `${suffix}...`
                    }
                }

                return `${angleBrackets2Entity(prefix)}<span class="${highlightClass}">${angleBrackets2Entity(highlight)}</span>${angleBrackets2Entity(suffix)}`
            })
            .join("&nbsp;&nbsp;&nbsp;&nbsp;")
    }

    /**
     * Show the meta information.
     */
    function showSearchToolbar(resultsLength) {
        let toolbarHtml = `<div>搜索到${resultsLength}个结果</div>`;

        document.querySelector("#searchBoxToolBar").innerHTML = toolbarHtml;
    }

    /**
      * Show search results.
      */
    function showSearchResults(results) {
        let innerHTML = results.map(result => {
            return `<li>
                        <a href=${result.permalink}  tabindex="0">
                            <div class="search-result-title">${result.path}${result.title}</div>
                            <ul class="search-result-paragraphs">${result.paragraphs}</ul>
                        </a>
                    </li>`;
        }).join("")

        document.querySelector("#searchResults").innerHTML = innerHTML
    }

    /**
     * No search Results.
     */
    function noSearchResults() {
        document.querySelector("#searchResults").innerHTML = `<li><div class="no-search-results">无结果</div></li>`
    }

    /**
     * When click search icon toggle Search Box show or hidden.
     */
    document.querySelector("#searchIcon").addEventListener("click", event => {
        toggleSearchBox();
    })

    /**
     * Toggle Search Box show or hidden. 
     */
    function toggleSearchBox() {
        if (isSearchBoxShow()) {
            hiddenSearchBox()
        } else {
            showSearchBox()
        }
    }

    function isSearchBoxShow() {
        return document.querySelector("#searchBox").style.display == "block"
    }

    /**
     * Show Search Box.
     */
    function showSearchBox() {
        document.querySelector("#searchBox").style.display = "block";
        document.querySelector("#searchInput").value = "";
        document.querySelector("#searchInput").focus();
    }

    /**
     * Hidden Search Box.
     */
    function hiddenSearchBox() {
        document.querySelector("#searchBox").style.display = "none";
        document.activeElement.blur();
    }

    /**
     * When click area(except search icon) that outside the search box, hidden it.
     */
    document.addEventListener("click", event => {
        var input = document.querySelector("#searchInput");
        var icon = document.querySelector("#searchIcon");
        var target = event.target;

        if (input != target && icon != target) {
            hiddenSearchBox()
        }
    })

    /**
     * Handle press enter.
     */
    function handlePressEnter() {
        if (document.querySelector("#searchInput") == document.activeElement) {
            openFirstSearchResult()
        }

        delayHiddenSearchBox()
    }

    /**
     * Delay hidden search box.
     */
    function delayHiddenSearchBox() {
        if (isSearchBoxShow()) {
            setTimeout(() => {
                hiddenSearchBox()
            }, 10);
        };
    }

    /**
     * Open first search result.
     */
    function openFirstSearchResult() {
        let firstLink = document.querySelector("#searchResults").querySelector("li").querySelector("a");
        if (firstLink) {
            let href = firstLink.getAttribute("href");
            window.open(href, "_self");
        }
    }

    /**
     * Allow control search box by keyboard.
     */
    document.addEventListener('keydown', function (event) {
        // "/"
        if (event.keyCode === 191) {
            // Stop print window open.
            event.preventDefault();

            // Toggle Search Box show or hidden. 
            toggleSearchBox();
        }

        // ESC 
        if (event.keyCode == 27) {
            // Hidden search box.
            hiddenSearchBox()
        }

        // Enter 
        if (event.keyCode == 13) {
            handlePressEnter()
        }


        // Down arrow and up arrow
        if (event.keyCode == 40 || event.keyCode == 38) {
            if (!isSearchBoxShow()) return;

            let input = document.querySelector('#searchInput');

            // <a> tags.
            let links = document.querySelector('#searchResults').querySelectorAll("a");

            // No search result.
            if (links.length == 0) return;

            // First <a> element.
            let first = links[0]

            // Second <a> element.
            let second = links[1]

            // Last <a> element.
            let last = links[links.length - 1];

            // Stop window from scrolling.
            event.preventDefault();

            // Down arrow.
            if (event.keyCode == 40) {
                // If the currently focused element is the main input. Focus the second <a>.
                if (document.activeElement == input) {
                    second.focus();
                }
                // If we're at the bottom, stay there.
                else if (document.activeElement == last) {
                    last.focus();
                }
                // Otherwise select the next search result.
                else {
                    // document -> focused <a> -> <li> -> next<li> -> <a>
                    document.activeElement.parentElement.nextElementSibling.firstElementChild.focus();
                }
            }

            // Up arrow
            if (event.keyCode == 38) {
                // If we're in the input box, do nothing
                if (document.activeElement == input) {
                    input.focus();
                }
                // If we're at the first item, go to input box
                else if (document.activeElement == first) {
                    input.focus();
                }
                // Otherwise, select the search result above the current active one
                else {
                    // document -> focused <a> -> <li> -> previous<li> -> <a>
                    document.activeElement.parentElement.previousElementSibling.firstElementChild.focus();
                }
            }
        }
    });
}

addLoadEvent(searchCallback)