# 1. 全局变量

## 1.1 使用 webpack.ProvidePlugin

+ 如果我们想要在项目中引入 jQuery，lodash 等第三方的库，那么我们不需要在每一个文件里都去引入这个库，我们可以在 webpack 里直接进行配置，然后可以在全局使用，这样方便我们使用

+ 假如我们想要使用 jQuery，在 webpack.ProviderPlugin 里的 key ，就是我们在项目中使用到的全局变量，value 就是我们要使用的库的名字

+ 原则上来说我，我们只需要配置一个 `$: 'jquery'` 就可以了，但是为了后期我们的方便开发，我们可以多配置几个，把 jQuery 等也都配置进去

+ 有一个问题，就是如果想要开发的时候使用 webpack 的全局变量，打包的时候使用 cdn，那么我们可以添加一个配置项 externals ，这个配置项是不打包某个包

+ 需要注意的是，plugins 里的和 externals 里的不能同时出现，因为不打包这个库，那么全局变量定义的时候就没有效果

+ 定义全局变量

```javascript
const Webpack = require('webpack');

module.exports = {
  plugins: [
    new Webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery'
    })
  ]
};
```

+ 不打包某个库

```javascript
module.exports = {
  externals: {
    jquery: '$'
  }
};
```

## 1.2 使用 expose-loader

+ 这个方法比较简单，但是需要下载使用 expose-loader

+ 我们直接在项目的入口文件里引入 jquery，在其他的模块里，可以直接使用 $，无需在 webpack 里进行全局变量配置

+ `import $ from 'expose-loader?$!jquery';`

# 2. 图片打包

+ 我们目前配置的 webpack 只能识别 js 和 css 及 css 预处理器，还不能打包图片，所以我们需要 webpack 能打包图片

## 2.1 js 和 css 引用图片

+ 如果我们直接在把图片的路径写成 `img.src='./static/logo.png'`，这样在打包之后得到是一个破图，因为这个路径就是一个字符串，而不是真实的图片资源。不仅如此，我们如果想要在 css 里引入某张图片作为背景图，依然会打包失败

```javascript
let image = new Image();

image.src = './static/logo.jpg';

document.body.appendChild(image);
```

+ 所以我们打包图片，需要使用 file-loader，然后配置 webpack

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpg|jpeg|png|gig)$/,
        loader: 'file-loader'
      }
    ]
  }
}
```

+ 然后我们在 js 里引用图片

```javascript
import './static/one.css';
import Logo from './static/logo.jpg';

let image = new Image();

console.log(Logo);

image.src = Logo;

document.body.appendChild(image);
```

## 2.2 html 里引用图片

+ 现在 js 和 css 里的图片都可以正常显示的，但是如果我们在 html 里的 img 标签里直接引用图片资源呢，答案还是会报错，因为我们没有对 html 做图片的处理

+ 解析 HTML使用到的图片，我们需要使用一个 loader，`html-withimg-loader`，我们来配置一下 webpack

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: ['html-withimg-loader']
      }
    ]
  }
}
```

+ 这个时候，我们在 html 里的 img 标签里引用图片，就不会报错了

## 2.3 把图片转为 base64

+ 有时候我们有一些小图，比如 icon 之类的，这么小的图，作为一次 http 请求实在是不划算，所以我们可以限制这些小图，转为 base64 的格式，减少 http 请求

+ 我们需要用到一个库，`url-loader`，这个库可以取代 file-loader，所以我们配置一下 webpack

+ limit 的值是限制多少字节以下的图片会被转为 base64，这里设置的是 20kb 以下的，当然，这个大小可以根据自己的需求进行设定。

+ base64 的代价就是体积会增加 1/3，所以针对一些小图是比较合适的，大图是不合适的

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpeg|jpg|png|gif|bmp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 20 * 1024
          }
        }
      }
    ]
  }
};
```

# 3. 文件分类

## 3.1 文件分类到不同文件夹下

+ 我们现在打包生成的文件，都是在 dist 目录下的，但是我们想让 css 文件在 css 的目录下，图片文件在 img 目录下，这个非常简单，只需要一行就可以配置成功，我们来配置一下

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpeg|jpg|png|gif|bmp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 20 * 1024,
            outputPath: 'img/'
          }
        }
      }
    ]
  },
  plugins: [
    new MiniCSSExtraPlugin({
      filename: 'css/main.css'
    })
  ]
};
```

+ 其实就是在图片配置里添加了一个 outputPath 的配置，在插件里的 MiniCSSExtraPlugin 里修改了 css 的 filename

+ 这样打包出来的文件就已经进行了分类，不同类型的文件是在不同的目录下

## 3.2 HTML 引用时加前缀

+ 我们先看一下现在我们的 HTML 里是什么样的，我们截取一段代码

```html
<link href="css/main.css?9788e4bab53364264542" rel="stylesheet"></head>
<body>
<h2 class="header">HELLO, HEADER</h2>
<img src="img/ac64b9f0da8d209b5c0c72b48e8a7126.jpg" alt="logo">
<ul>
  <li><span class="one">css</span></li>
  <li><span class="two">less</span></li>
  <li><span class="three">styl</span></li>
  <li><span class="four">sass</span></li>
</ul>

<script type="text/javascript" src="bundle.9788e4ba.js?9788e4bab53364264542"></script></body>
```

+ 我们可以看到，在 HTML 引用的 css 和图片的时候，已经加上了目录，但是还不够，我们想要把打包后的文件，放入 cdn 上，我们不想打包后手动修改

+ 我们可以给 webpack 的 output 配置项添加一个 publicPath 的属性，这个值就是用来给打包后的文件添加前缀的，假如说我们现在的前缀是 http://www.static.yourdomain.com/static/

+ 配置 webpack 的 output

```javascript
module.exports = {
  output: {
    filename: "bundle.[hash:8].js",
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://www.static.yourdomain.com/static/'
  }
};
```

+ 现在我们打开 HTML 查看，会发现所有的静态资源都已经添加了 publicPath 的值的前缀

+ 但是我想要某一类文件添加这个前缀，不想所有的文件都添加，我们可以单个配置，比如说我们配置图片

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jpeg|jpg|png|gif|bmp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 20 * 1024,
            outputPath: 'img/',
            publicPath: 'http://www.static.yourdomain.com/static/'
          }
        }
      }
    ]
  }
};
```

+ 这样打包出来的就只有图片加了前缀，css 文件没有添加前缀

+ 这样够了吗？还不够，我还想把打包后的图片，直接上传到 cdn 上，直接引用 cdn 的资源，这个，我们放在后边介绍

+ 完整的代码可以查看 03-webpack.config.js
