# async-dom

APIs for reading and writing DOM asynchronously.

## Overview

async-dom solve two related problems:
 * Prevent layout thrashing due to finely interleaved DOM mutation and measuring. This is addressed by coordinating and batching read and write tasks from multiple actors.
 * Provide a consistent API for reading from async components - components that build themselves asynchronously. Reads and writes should wait until the component is ready.

## API

### Element.readAsync(nextFrame : boolean) : Promise
Returns a Promise that resolves during the next DOM read phase.

In strict mode, layout flushing API calls to the element are allowed in tasks, but mutations are disallowed.

### Element.writeAsync(nextFrame : boolean) : Promise
Returns a Promise that resolves during the next DOM write phase.

In strict mode, layout flushing API calls to the element are disallowed in tasks, but mutations are allowed.

### Element.waitFor(promise : Promise, options)
Defers resolution of any subsequently requested DOM promises until after argument has completed.

Because containers by default depend on the layout of their descendants, waitFor() bubbles up the tree, blocking subsequent DOM promises for all ancestor elements as well, but not for descendent or sibling elements.

Bubbling of waitFor() stops if an element is strictly contained (not implemented): https://drafts.csswg.org/css-containment/

### Element.enableStrictDom() (Not Implemented)
Enables and disables strict mode, which prohibits some API calls outside of tasks.
