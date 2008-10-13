/*
 * spec.js - an unfinished attempt at writing a better JSSpec.
 *
 * Copyright (c) 2007, John W. Long. Released under the MIT License.
 *
 */

/* Utility Stuff */

var IO = Class.create({
  
  initialize: function(element) {
    if (element != undefined) {
      this.element = element
    } else {
      this.element = new Element('div', { style: "font: 85% Monaco, Courier, 'Courier New', monospace; padding: 10px" });
    }
  },
  
  print: function() {
    var args = $A(arguments);
    var text = args.join(" ");
    this.element.appendChild(window.document.createTextNode(text));
  },
  
  puts: function() {
    var br = new Element('br');
    print.apply(this, arguments);
    this.element.insert(br);
  },
  
  toElement: function() {
    return this.element;
  }
  
});

$stdout = new IO;
$stderr = $stdout;

function print() {
  $stdout.print.apply($stdout, arguments);
}

function puts(args) {
  $stdout.puts.apply($stdout, arguments);
}

/* Spec */

$pending = function() { pending(); };

var Spec = {};

Spec.ExecutionContext = Class.create({
  initialize: function(description) {
    this.description = description;
  },
  
  execute: function(example) {
    var lines = $A();
    for (name in Spec.DSL) {
      var method = Spec.DSL[name];
      lines.push('var ' + name + ' = ' + method.toString());
    }
    lines.push('var example = ' + example.toString() + '; example.bind(this); example()');
    eval(lines.join('; '));
  }
});

Spec.Failure = Class.create({
  initialize: function(message) {
    this.name = 'Spec.Failure';
    this.message = message || '';
  }
});

Spec.Pending = Class.create({
  initialize: function(message) {
    this.name = 'Spec.Pending';
    this.message = message || '';
  }
});

Spec.Expectation = Class.create({
  initialize: function(object) {
    this.object = object;
  },
  
  shouldBeEqual: function(expected) {
    if (this.object !== expected)
      throw new Spec.Failure(this._stringify('expected <', this.object, '> to equal <', expected, '> but it did not'));
  },
  
  _stringify: function() {
    var result = $A();
    $A(arguments).each(function(object) {
      if (object.constructor == String){
        result.push(object);
      } else {
        if (object.inspect) {
          result.push(object.inspect());
        } else {
          result.push(object.toString());
        }
      }
    });
    return result.join('');
  }
});

Spec.DSL = {
  expect: function(object){
    return new Spec.Expectation(object)
  },
  
  pending: function(message) {
    throw new Spec.Pending(message);
  }
}

Spec.ExampleResult = Class.create({
  initialize: function(description, example, result, exception) {
    this.description = description;
    this.example = example;
    this.result = result;
    this.exception = exception;
  }
});

Spec.Description = Class.create({
  initialize: function(name, examples) {
    this.name = name;
    this.examples = examples;
    this.context = new Spec.ExecutionContext(this);
  },
  
  runExample: function(example) {
    try {
      this.context.execute(this.examples[example]);
      return new Spec.ExampleResult(this.name, example, 'SUCCESS');
    } catch(exception) {
      switch(exception.name) {
        case 'Spec.Pending': return new Spec.ExampleResult(this.name, example, 'PENDING')
        case 'Spec.Failure': return new Spec.ExampleResult(this.name, example, 'FAILURE', exception);
        default:             return new Spec.ExampleResult(this.name, example, 'ERROR', exception);
      }
    }
  },
  
  beforeAll: function() {},
  
  beforeEach: function() {},
  
  afterEach: function() {},
  
  afterAll: function() {},
  
  clone: function() {
    object = Object.clone(this);
    object.context = Object.clone(this.context);
    return object;
  }
});

Spec.descriptions = $A();

function describe() {
  var args = $A(arguments);
  object = new Object;
  object.examples = args.pop();
  object.name = args.join(" ");
  Spec.descriptions.push(object);
}

Spec.Runner = Class.create({
  
  initialize: function(descriptions) {
    this.descriptions = descriptions;
  },
  
  run: function(out) {
    var example_count = 0;
    var failures = $A();
    var errors = $A();
    var pending = $A();
    var time = this.benchmark(function() {
      this.descriptions.each(function(raw) {
        out.puts(raw.name);
        var description = new Spec.Description(raw.name, raw.examples);
        description.beforeAll();
        var exampleDescription = null;
        for (name in raw.examples) {
          exampleDescription = description.clone();
          exampleDescription.beforeEach();
          out.print('--' + name);
          var result = exampleDescription.runExample(name);
          switch(result.result) {
            case 'FAILURE': failures.push(result); break;
            case 'ERROR': errors.push(result); break;
            case 'PENDING': pending.push(result); break;
          }
          example_count++;
          out.print(' ' + result.result + '');
          exampleDescription.afterEach();
          out.puts();
        };
        exampleDescription.afterAll();
        out.puts();
      }.bind(this));
    }.bind(this));
    out.puts('Finished in', time/1000, 'seconds');
    out.puts();
    out.puts(
      example_count, this.pluralize('example', example_count) + ',',
      failures.size(), this.pluralize('failure', failures.size()) + ',',
      errors.size(), this.pluralize('error', errors.size())
    );
  },
  
  benchmark: function(operation) {
    var started = new Date();
    operation.call();
    var ended = new Date();
    return ended - started;
  },
  
  pluralize: function(word, count) {
    if ((count == 0) || (count > 1)) {
      return word = word + 's';
    } else {
      return word;
    }
  }
  
});

Spec.Runner.run = function(out) {
  var runner = new Spec.Runner(Spec.descriptions);
  runner.run(out);
}

Spec.Runner.options = {
  autoRun: true
}

/* On Load */

Event.observe(window, 'load', function() {
  $$('body')[0].insert($stdout);
  if (Spec.Runner.options['autoRun']) Spec.Runner.run($stdout);
});