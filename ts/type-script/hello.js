var MyClass = /** @class */ (function () {
    function MyClass() {
    }
    MyClass.printX = function () {
        console.log(MyClass.x);
    };
    MyClass.x = 0;
    return MyClass;
}());
console.log(MyClass.x);
MyClass.printX();
