// from https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};


// helper function to format year into a date object
var createDate = function(dateString) {
    var format = d3.time.format("%Y");
    // create a JavaScript data object based on the string
    return format.parse(dateString);
};
