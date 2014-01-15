var editor = function(){
    this.name = 'alma';
    init.apply(this, arguments);
    function init()
    {
        this.args=arguments;
        console.log('editor arguments');
        console.log(arguments);
    }
};

var Editor = function () {
    // Call the parent constructor
    editor.call(this);
};
Editor.prototype = new editor();

/*Editor.prototype.constructor = Editor;
 */
Editor.prototype.init = function() {
    //alert('editor init from editor func');
    //if(isTouchEnabled) return false;
    var $article = $('.article');
    var model = new article();
    var view = new articleView({model: model, el: $article[0], tagName: $article[0].tagName});
    console.log('$article')
    console.log(view)
};

Editor.prototype.destroy = function() {
    console.log('this.name destroy');
    console.log(this.name);
};

var editorInstance = null;
//editorInstance = new Editor();
//editorInstance.init();
