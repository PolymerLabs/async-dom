(() => {

  class DomTask {
    constructor(onStart) {
      this.onStart = onStart;
      this.pendingWaits = 0;
      this.readPromise = new Promise((resolve, _) => {
        this.readResolve = resolve;
      });
      this.writePromise = new Promise((resolve, _) => {
        this.writeResolve = resolve;
      });
    }

    waitFor(promise) {
      this.pendingWaits++;
      let onComplete = () => {
        if (this.pendingWaits <= 0) {
          throw new Error('too many promises completed');
        }
        this.pendingWaits--;
        if (this.pendingWaits === 0) {
          this.flush();
        }
      };
      // this handles fulfillment and rejection the same
      // this may not be correct!
      promise.then(onComplete, onComplete);
    }

    flush() {
      this.onStart();
      this.readResolve();
      this.writeResolve();
    }
  }

  Element.prototype.readAsync = function() {
    return this._getDomTask().readPromise;
  }

  Element.prototype.writeAsync = function() {
    return this._getDomTask().writePromise;
  }

  Element.prototype.waitFor = function(promise) {
    this._domTask = this._domTask || new DomTask(() => {
      this._domTask = null;
    });
    this._domTask.waitFor(promise);
    // walk up the tree and make everything wait
    let taskParent = this._getTaskParent();
    if (taskParent) {
      taskParent.waitFor(promise);
    }
  }

  Element.prototype._getTaskParent = function() {
    // parent element or shadow root host
    return this.parentElement || (this.parentNode ? this.parentNode.host : null);
  }

  let _globalTask;

  Element.prototype._getDomTask = function() {
    if (this._domTask) {
      return this._domTask;
    }
    if (!_globalTask) {
      _globalTask = new DomTask(() => {
        _globalTask = null;
      });
      // kick the task
      _globalTask.waitFor(Promise.resolve());
    }
    return _globalTask;
  }

})();
