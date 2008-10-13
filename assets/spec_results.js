function postResults(result) {
  resultsURL = parseResultsURLQueryParameter();
  if (resultsURL) {
    new Ajax.Request(resultsURL, {
      method: 'get',
      parameters: 'result=' + result,
      asynchronous: false
    });
  }
}

function parseResultsURLQueryParameter() {
  return window.location.search.parseQuery()["resultsURL"];
}

JSSpec.Logger.prototype.onRunnerEnd = JSSpec.Logger.prototype.onRunnerEnd.wrap(function(proceed) {
  if (JSSpec.runner.getTotalFailures() > 0) {
    postResults('FAILURE');
  } else {
    if (JSSpec.runner.getTotalErrors() > 0) {
      postResults('ERROR')
    } else {
      postResults('SUCCESS');
    }
  }
  proceed();
});