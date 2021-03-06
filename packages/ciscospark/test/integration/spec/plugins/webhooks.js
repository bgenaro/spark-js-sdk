/**!
 *
 * Copyright (c) 2015-2016 Cisco Systems, Inc. See LICENSE file.
 */

import {assert} from '@ciscospark/test-helper-chai';
import {SparkHttpError} from '@ciscospark/spark-core';
import sinon from '@ciscospark/test-helper-sinon';
import spark from '../../..';

describe(`ciscospark`, function() {
  this.timeout(60000);
  describe(`#webhooks`, () => {
    let room;
    before(() => {
      return spark.rooms.create({
        title: `Cisco Spark Webhook Test Room`
      })
        .then((r) => {room = r;});
    });

    let webhook;
    const webhooks = [];
    beforeEach(() => {
      return spark.webhooks.create({
        resource: `messages`,
        event: `created`,
        filter: `roomId=${room.id}`,
        targetUrl: `https://example.com`,
        name: `Test Webhook`
      })
        .then((w) => {
          webhook = w;
          webhooks.push(webhook);
        });
    });

    after(() => {
      return Promise.all(webhooks.map((webhook) => {
        return spark.webhooks.remove(webhook)
          .catch((reason) => {
            console.warn(`failed to remove webhook`, reason);
          });
      }));
    });

    after(() => {
      return spark.rooms.remove(room)
        .catch((reason) => {
          console.warn(`failed to remove room`, reason);
        });
    });

    describe(`#create()`, () => {
      it(`creates a webhook that listens for new messages`, () => {
        return spark.webhooks.create({
          resource: `messages`,
          event: `created`,
          filter: `roomId=${room.id}`,
          targetUrl: `https://example.com`,
          name: `Test Webhook`
        })
          .then((webhook) => {
            webhooks.push(webhook);
            assert.isWebhook(webhook);
          });
      });
    });

    describe(`#get()`, () => {
      it(`retrieves a specific webhook`, () => {
        return spark.webhooks.get(webhook.id)
          .then((w) => {
            assert.deepEqual(w, webhook);
          });
      });
    });

    describe(`#list()`, () => {
      it(`retrieves all the webhooks to which I have access`, () => {
        return spark.webhooks.list()
          .then((webhooks) => {
            assert.isAbove(webhooks.length, 0);
            for (webhook of webhooks) {
              assert.isWebhook(webhook);
            }
            assert.include(webhooks.items, webhook);
          });
      });

      it(`retrieves a bounded set of webhooks`, () => {
        const spy = sinon.spy();
        return spark.webhooks.list({max: 1})
          .then((webhooks) => {
            assert.lengthOf(webhooks, 1);
            return (function f(page) {
              for (const webhook of page) {
                spy(webhook.id);
              }

              if (page.hasNext()) {
                return page.next().then(f);
              }

              return Promise.resolve();
            }(webhooks));
          })
          .then(() => {
            assert.isAbove(spy.callCount, 0);
          });
      });
    });

    describe(`#update()`, () => {
      it(`updates the target url of the specified webhook`, () => {
        webhook.targetUrl = `https://example.com/newpath`;
        return spark.webhooks.update(webhook)
          .then((w) => {
            assert.deepEqual(w, webhook);
          });
      });

      it(`updates the name of the specified webhook`, () => {
        webhook.name = `new name`;
        return spark.webhooks.update(webhook)
          .then((w) => {
            assert.deepEqual(w, webhook);
          });
      });
    });

    describe(`#remove()`, () => {
      it(`removes the specified webhook`, () => {
        return spark.webhooks.remove(webhook)
          .then((body) => {
            assert.notOk(body);
            return assert.isRejected(spark.webhooks.get(webhook));
          })
          .then((reason) => {
            assert.instanceOf(reason, SparkHttpError.NotFound);
          });
      });
    });
  });
});
