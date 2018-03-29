/*
Copyright 2016 First People's Cultural Council

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import _ from 'underscore';
import StringHelpers from 'common/StringHelpers';

import Nuxeo from 'nuxeo';

import BaseOperations from 'operations/BaseOperations';

const TIMEOUT = 60000;

export default class DirectoryOperations extends BaseOperations {

  /*constructor(directoryType, directoryTypePlural, client, properties = []){
    super();

    this.directoryType = directoryType;
    this.directoryTypePlural = directoryTypePlural;
    this.client = client;
    this.properties = properties;

    this.selectDefault = "ecm:currentLifeCycleState <> 'deleted'";
  }*/

  /**
  * Get a single document of a certain type based on a path and title match
  * This document may or may not contain children 
  */
  static getDocumentByPath2(path = "", type = "Document", queryAppend = " ORDER BY dc:title", headers = null, params = null) {

    let defaultParams = {};
    let defaultHeaders = {};

    params = Object.assign(defaultParams, params);
    headers = Object.assign(defaultHeaders, headers);

    let properties = this.properties;

    // Replace Percent Sign
    queryAppend = queryAppend.replace(/%/g, "%25");

    let requestBody;

    // Switch between direct REST access and controlled mode
    if (path.indexOf('/api') === 0) {
      // NOTE: Do not escape single quotes in this mode
      requestBody = path.replace('/api/v1', '');
    } else {
      requestBody = '/query?query=SELECT * FROM ' + type + ' WHERE ecm:path STARTSWITH \'' + StringHelpers.clean(path) + '\' AND ecm:currentLifeCycleState <> \'deleted\'' + queryAppend;
    }

    return new Promise(
      function(resolve, reject) {
        properties.client.request(
          requestBody,
          params
        )
        .get(headers)
        .then((docs) => {
          resolve(docs);
        }).catch((error) => {

          if (error.hasOwnProperty('response')) {
            error.response.json().then(
              (jsonError) => {
                reject(StringHelpers.extractErrorMessage(jsonError));
              }
            );
          } else { 
            return reject(error || 'Could not access server');
          }
        });

        setTimeout(function() {
            reject('Server timeout while executing getDocumentByPath2.');
        }, TIMEOUT);
    });
  }

  static getDocumentsViaPageProvider(page_provider = "", type = "Document", queryAppend = "", headers = null, params = null) {

    let defaultParams = {};
    let defaultHeaders = {};

    params = Object.assign(defaultParams, params);
    headers = Object.assign(defaultHeaders, headers);

    let properties = this.properties;

    return new Promise(
      function(resolve, reject) {
        properties.client.request(
          '/query/' + page_provider + '?' + queryAppend,
          params
        )
        .get({ headers: headers })
        .then((docs) => {
          resolve(docs);
        }).catch((error) => { reject('Could not access server.'); });
    });
  }


  static getDirectory(name = "", headers = {}, params = {}) {

    let properties = this.properties;

    return new Promise(
      function(resolve, reject) {
        properties.client
        .directory(name)
        .fetchAll()
        .then((directory) => {
          resolve(directory);
        }).catch((error) => { reject('Could not retrieve directory.'); });
    });
  }

  /**
  * Get all documents of a certain type based on a path
  * These documents are expected to contain other entries
  * E.g. FVFamily, FVLanguage, FVDialect
  */
  getDocumentsByPath(path = "", headers = null, params = null) {
    // Expose fields to promise
    let client = this.client;
    let selectDefault = this.selectDefault;
    let domain = this.properties.domain;

    path = StringHelpers.clean(path);

    // Initialize and empty document list from type
    let documentList = new this.directoryTypePlural(null);

    return new Promise(
        // The resolver function is called with the ability to resolve or
        // reject the promise
        function(resolve, reject) {

          let defaultParams = {
            query: 
              "SELECT * FROM " + documentList.model.prototype.entityTypeName + " WHERE (ecm:path STARTSWITH '/" + domain + path + "' AND " + selectDefault + ") ORDER BY dc:title"
          };

          let defaultHeaders = {};

          params = Object.assign(defaultParams, params);
          headers = Object.assign(defaultHeaders, headers);

          client.operation('Document.Query')
            .params(params)
            .execute(headers).then((response) => {

              if (response.entries && response.entries.length > 0) {
                
                documentList.add(response.entries);
                documentList.totalResultSize = response.totalSize;

                resolve(documentList);
              } else {
                reject('No ' + documentList.model.prototype.entityTypeName +' found');
              }
          }).catch((error) => { throw error });
    });
  }

  // Unused methods below (needs refactoring or removing soon)
  getSubjects(client) {
    return new Promise(
    function(resolve, reject) {

        client.request('directory/subtopic')
       .get(function(error, data) {
         if (error) {
           // something went wrong
           throw error;
         }

        if (data.entries.length > 0) {
            //entry.properties.label
            var subtopics = _.object(_.map(data.entries, function(entry){ return [entry.properties.id, entry.properties.id]; }));
            resolve(subtopics);
        } else {
          reject('Workspace not found');
        }

      });
    });
  }
  getPartsOfSpeech(client) {
    return new Promise(
      function(resolve, reject) {

          client.request('directory/parts_speech')
         .get(function(error, data) {
           if (error) {
             // something went wrong
             throw error;
           }

          if (data.entries.length > 0) {
            //entry.properties.label
              var parts_speech = _.object(_.map(data.entries, function(entry){ return [entry.properties.id, entry.properties.id]; }));
              resolve(parts_speech);
          } else {
            reject('Workspace not found');
          }

        });

      });
  }
  
}