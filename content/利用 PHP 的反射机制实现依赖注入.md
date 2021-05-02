## 认识ReflectionClass类

该类实现了`Reflector`接口，使得我们可以使用该类查看另一个类的相关信息。所谓的反射，大概的意思就是将一个类的相关信息给反射（映射、反映）出来。

 定义两个类以供测试。

> 完整的代码附在后面。

```php
<?php

namespace Models;

class Car
{
    protected $engine; //引擎

    public static $name = '卡丁车'; //车名
    public static $model; //型号
    public $price = 200000; //售价
    public $color = 'red'; //颜色

    const WIDTH = 2; //车宽
    const HEIGHT = 1.5; //车高

    public function __construct(Engine $engine)
    {
        $this->engine = $engine;
    }

    /**
     * 开车
     *
     * @return void
     */
    public function drive()
    {
    }

    //给汽车加油
    public static function fuel()
    {
    }
}

class Engine
{
    public function __construce()
    {
    }
}

$reflector = new \ReflectionClass(new Car(new Engine()));
```

### 属性相关的方法

```php
//获取一个属性，类似的有getProperties()，获取一组属性
$price = $reflector->getProperty('price');
dump($price);

//获取属性默认值
$defaultProperties = $reflector->getDefaultProperties();
dump($defaultProperties);

//检测是否含有某个属性
$result = $reflector->hasProperty('price');
dump($result);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115300.png)


### 静态属性相关的方法

```php

//获取某个静态属性值
$value = $reflector->getStaticPropertyValue('name');
dump($value);

//获取所有静态属性
$staticProperties = $reflector->getStaticProperties();
dump($staticProperties);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115312.png)



### 常量相关的方法

```php
//获取某一个常量，类似的有 getConstants() ，获取一组常量
$width = $reflector->getConstant('WIDTH');
dump($width);

//检测是否含有某个常量
$result = $reflector->hasConstant('HEIGHT');
dump($result);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115329.png)

### 方法相关的方法

```php
//获取某个方法，类似的有 getMethods() ，获取一组方法
$method = $reflector->getMethod('drive');
dump($method);

//检测是否含有某个方法
$result = $reflector->hasMethod('fuel');
dump($result);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115547.png)


### 类自身相关的方法

```php
//获取类文件所在的文件名
$filename = $reflector->getFileName();
dump($filename);

//获取带命名空间的类名
$className = $reflector->getName();
dump($className);

//获取不带命名空间的类名
$shortClassName = $reflector->getShortName();
dump($shortClassName);

//检测是否能被实例化，因为抽象类和接口不能被实例化
$result = $reflector->isInstantiable();
dump($result);

//获取构造器
$constructor = $reflector->getConstructor();
dump($constructor);

//获取注释
$docs = $reflector->getMethod('drive')->getDocComment();
dump($docs);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115631.png)

### getConstructor()

> 其余还有一些方法，暂时放一放。还需要再深入认识一下上文中提到的`getConstructor`，因为下文中要用到。


`getConstructor()`方法返回的是一个`ReflectionMethod`类，`ReflectionMethod`类可以反射(映射、反映)出一个**方法**中的相关信息。所以接着看一看上文中的 `$constructor`。

```php
//获取构造器，得到的是 ReflectionMethod 类
$constructor = $reflector->getConstructor();
dump($constructor);
//通过构造器获取其参数，得到的是一个数组
$parameters = $constructor->getParameters();
dump($parameters);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115716.png)


现在获得了一个数组，数组中每个元素都是`ReflectionParameter`类，`ReflectionParameter`类中有一个方法叫做`getClass()`，返回一个`ReflectionClass`类，也就是文章一开始提到的那个类。

```php
//将数组中第一个元素拿出来，调用getClass()，得到一个ReflectionClass类
$dependency = $parameters[0]->getClass();
dump($dependency);
```
![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115406.png)

### 完整代码
```php
<?php

namespace Models;

class Car
{
    protected $engine; //引擎

    public static $name = '卡丁车'; //车名
    public static $model; //型号
    public $price = 200000; //售价
    public $color = 'red'; //颜色

    const WIDTH = 2; //车宽
    const HEIGHT = 1.5; //车高

    public function __construct(Engine $engine)
    {
        $this->engine = $engine;
    }

    /**
     * 开车
     *
     * @return void
     */
    public function drive()
    {
    }

    //给汽车加油
    public static function fuel()
    {
    }
}

class Engine
{
    public function __construce()
    {
    }
}

$reflector = new \ReflectionClass(new Car(new Engine()));

//获取一个属性，类似的有getProperties()，获取一组属性
$price = $reflector->getProperty('price');
dump($price);

//获取属性默认值
$defaultProperties = $reflector->getDefaultProperties();
dump($defaultProperties);

//检测是否含有某个属性
$result = $reflector->hasProperty('price');
dump($result);

//获取某个静态属性值
$value = $reflector->getStaticPropertyValue('name');
dump($value);

//获取所有静态属性
$staticProperties = $reflector->getStaticProperties();
dump($staticProperties);

//获取某一个常量，类似的有getConstants()，获取一组常量
$width = $reflector->getConstant('WIDTH');
dump($width); // 输出2

//检测是否含有某个常量
$result = $reflector->hasConstant('HEIGHT');
dump($result); // 输出 true

//获取某个方法，类似的有getMethods()，获取一组方法
$method = $reflector->getMethod('drive');
dump($method);

//检测是否含有某个方法
$result = $reflector->hasMethod('fuel');
dump($result);

//获取类文件所在的文件名
$filename = $reflector->getFileName();
dump($filename);

//获取带命名空间的类名
$className = $reflector->getName();
dump($className);

//获取不带命名空间的类名
$shortClassName = $reflector->getShortName();
dump($shortClassName);

//检测是否能被实例化，因为抽象类和接口不能被实例化
$result = $reflector->isInstantiable();
dump($result);

//获取构造器
$constructor = $reflector->getConstructor();
dump($constructor);

//获取注释
$docs = $reflector->getMethod('drive')->getDocComment();
dump($docs);

//获取构造器，得到的是ReflectionMethod类
$constructor = $reflector->getConstructor();
dump($constructor);
//通过构造器获取其参数，得到的是一个数组
$parameters = $constructor->getParameters();
dump($parameters);

//将数组中第一个元素拿出来，调用getClass()，得到一个ReflectionClass类
$dependency = $parameters[0]->getClass();
dump($dependency);
```

## 利用反射机制实例化类

### 无依赖的情况

要实例化一个类，获得其完整类名即可，实际项目中还需要结合自动加载，这里为了方便说明情况，就将所有类写在同一个文件中。这个操作很简单。

```php
<?php

namespace Models;

class Car
{
}

namespace Framework;

class App
{
    public function getInstance($className)
    {
        //实例化 ReflectionClass 对象
        $reflector = new \ReflectionClass($className);

        if (!$reflector->isInstantiable()) {
            //不能被实例化的逻辑
            return false;
        }

        //获取构造器
        $constructor = $reflector->getConstructor();

        //如果没有构造器，直接实例化
        if (!$constructor) {
            //这里用了变量来动态的实例化类
            return new $className;
        }
    }
}

$app = new App();
$car = $app->getInstance('Models\Car');
dump($car);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115406.png)


上面的`Car`这个类没有其他依赖，所以操作起来很简单，加入几个依赖，再来看看。

### 带有多层依赖的情况

假设有一个汽车依赖底盘，底盘依赖轮胎和轴承，轮胎也依赖轴承，轴承无依赖。那么当需要实例化一个汽车类时，不友好的方式是这样的，打脑阔。
```php
$car = new Car(new Chassis(new Tyre(new Axle), new Axle()))
```

利用依赖注入是这样的，关于依赖注入可以参考[依赖注入&容器](https://starry.blog/posts/1)。


```php
<?php

namespace Framework;

//定义一个类，用于实现依赖注入
class App
{
    public function getInstance($className)
    {
        //实例化 ReflectionClass 对象
        $reflector = new \ReflectionClass($className);

        if (!$reflector->isInstantiable()) {
            //不能被实例化的逻辑，抽象类和接口不能被实例化
            return false;
        }

        //获取构造器
        $constructor = $reflector->getConstructor();

        //如果没有构造器，也就是没有依赖，直接实例化
        if (!$constructor) {
            return new $className;
        }

        //如果有构造器，先把构造器中的参数获取出来
        $parameters = $constructor->getParameters();

        //再遍历 parameters ，找出每一个类的依赖，存到 dependencies 数组中
        $dependencies = array_map(function ($parameter) {
            /**
             * 这里是递归的去寻找每一个类的依赖，例如第一次执行的时候，程序发现汽车 Car 类依赖底盘 Chassis
             * 类，此时 $parameter 是一个ReflectionParameter 的实例，接着调用 ReflectionParameter
             * 的 getClass() 方法，获得一个 ReflectionClass 的实例，再接着调用 ReflectionClass
             * 的 getName() 方法，取得类名，也就是 Models\Chassis ，但此时此刻还不能直接去 new
             * Models\Chassis ，因为 Models\Chassis 也有依赖，故要递归的去调用 getInstance
             * 进一步去寻找该类的依赖，周而复始，直到触发上面的 if(!$constructor) ，停止递归。
             */
            return $this->getInstance($parameter->getClass()->getName());
        }, $parameters);

        //最后，使用 ReflectionClass 类提供的 newInstanceArgs ，方法去实例化类，参数将会传入构造器中
        return $reflector->newInstanceArgs($dependencies);
    }
}

namespace Models;

class Car
{
    protected $chassis;

    //汽车依赖底盘
    public function __construct(Chassis $chassis)
    {
        $this->chassis = $chassis;
    }
}

class Chassis
{
    protected $tyre;
    protected $axle;

    //底盘依赖轮胎和轴承
    public function __construct(Tyre $tyre, Axle $axle)
    {
        $this->tyre = $tyre;
        $this->axle = $axle;
    }
}

class Tyre
{
    protected $axle;

    //轮胎也依赖轴承
    public function __construct(Axle $axle)
    {
        $this->axle = $axle;
    }
}

class Axle
{
    //轴承无依赖
}

$app = new \Framework\App();
$car = $app->getInstance('Models\Car');
dump($car);
```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115823.png)


这时候，无论有多少依赖，有多少层依赖，都可以友好的注入。但是目前还有一个问题，如果一个类的构造器中的参数没有限定类型，上面的代码就会报错。假设将上文中的`Car`类改成这样。

```php
class Car
{
    protected $chassis;
    protected $width;
    //汽车依赖底盘
    public function __construct(Chassis $chassis, $width) // <-----多加入了一个参数且不限定类型
    {
        $this->chassis = $chassis;
        $this->width = $width;
    }
}
```

运行代码，报错`call to function  getName() on null`，问题出在了这里。

```php
return $this->getInstance($parameter->getClass()->getName())
```

原因是`$parameter->getClass()`的结果是null，这也是必然的。查看手册发现这样的一段描述，ReflectionParameter::getClass — Get the type hinted class (获取所提示的类)，上面加入的`$width`，没有做类型提示，`$parameter->getClass()`得到的结果必然是`null`。

> 故，将有类型提示的和没有类型提示的分开处理。

### 处理普通参数

```php
<?php

namespace Framework;

class App
{
    public function getInstance($className)
    {
        $reflector = new \ReflectionClass($className);

        if (!$reflector->isInstantiable()) {
            return false;
        }

        $constructor = $reflector->getConstructor();

        if (!$constructor) {
            return new $className;
        }

        $parameters = $constructor->getParameters();

        $dependencies = array_map(function ($parameter) {
            if (null == $parameter->getClass()) {
                //处理没有类型提示的参数
                return $this->processNoHinted($parameter);
            } else {
                //处理有类型提示的参数
                return $this->processHinted($parameter);
            }
        }, $parameters);

        return $reflector->newInstanceArgs($dependencies);
    }

    protected function processNoHinted(\ReflectionParameter $parameter)
    {
        if ($parameter->isDefaultValueAvailable()) {
            return $parameter->getName();
        } else {
            //参数为空则抛出异常
            throw new \Exception($parameter->getName() . "不能为空", 1);
        }
    }

    protected function processHinted(\ReflectionParameter $parameter)
    {
        return $this->getInstance($parameter->getClass()->getName());
    }
}


namespace Models;

class Car
{
    protected $chassis;
    protected $width;

    public function __construct(Chassis $chassis, $width = 2)
    {
        $this->chassis = $chassis;
        $this->width = $width;
    }
}

class Chassis
{
    protected $tyre;
    protected $axle;

    public function __construct(Tyre $tyre, Axle $axle)
    {
        $this->tyre = $tyre;
        $this->axle = $axle;
    }
}

class Tyre
{
    protected $axle;

    public function __construct(Axle $axle)
    {
        $this->axle = $axle;
    }
}

class Axle
{
}

$app = new \Framework\App();
$car = $app->getInstance('Models\Car');
dump($car);

```

![](https://cdn.jsdelivr.net/gh/pys1992/storage@main/20210402115841.png)


可以看到传入的普通参数`$width`也能够被正确的处理了。