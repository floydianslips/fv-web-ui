package ca.bc.gov.nuxeo.utils;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ObjectNode;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.DocumentNotFoundException;
import org.nuxeo.ecm.core.api.IdRef;
import org.nuxeo.ecm.core.blob.binary.BinaryBlob;
import org.nuxeo.ecm.directory.Session;
import org.nuxeo.ecm.directory.api.DirectoryService;
import org.nuxeo.runtime.api.Framework;


public class EnricherUtils {

    private static final Log log = LogFactory.getLog(EnricherUtils.class);

    private static ObjectMapper mapper = new ObjectMapper();

	/**
	 *	Retrieve additional binary document properties for a given id, and return them in a JSON object.
	 */
	public static ObjectNode getBinaryPropertiesJsonObject(String binaryId, CoreSession session) {

		IdRef ref = new IdRef(binaryId);
		DocumentModel binaryDoc = null;
		ObjectNode binaryJsonObj = mapper.createObjectNode();

		try {
			binaryDoc = session.getDocument(ref);
			// Retrieve binary details, including the path to the file
			BinaryBlob fileObj = (BinaryBlob)binaryDoc.getProperty("file", "content");
			String filename = fileObj.getFilename();
			String mimeType = fileObj.getMimeType();
			// TODO: not sure how to retrieve this value from the object, so build it manually for now
			String binaryPath = "nxfile/default/" + binaryDoc.getId() + "/file:content/" + filename;

			// Build JSON node
			binaryJsonObj.put("uid", binaryDoc.getId());
			binaryJsonObj.put("name", filename);
			binaryJsonObj.put("mime-type", mimeType);
			binaryJsonObj.put("path", binaryPath);
			binaryJsonObj.put("dc:title", (String)binaryDoc.getPropertyValue("dc:title"));
			binaryJsonObj.put("dc:description", (String)binaryDoc.getPropertyValue("dc:description"));
		} catch (DocumentNotFoundException de) {
    		log.warn("Could not retrieve binary document.", de);
			return null;
		} catch (Exception e) {
			log.error(e.getMessage());
		}

		return binaryJsonObj;
	}

	/**
	 *	Retrieve additional properties for a Link document with a given id, and return them in a JSON object.
	 */
	public static ObjectNode getLinkJsonObject(String binaryId, CoreSession session) {

		if (binaryId == null) {
			return null;
		}

		IdRef ref = new IdRef(binaryId);
		DocumentModel linkDoc = null;
		ObjectNode linkJsonObj = mapper.createObjectNode();

		try {
			linkDoc = session.getDocument(ref);

			// Build JSON node
			linkJsonObj.put("uid", linkDoc.getId());
			linkJsonObj.put("title", linkDoc.getTitle());
			linkJsonObj.put("description", (String)linkDoc.getPropertyValue("dc:description"));
			linkJsonObj.put("url", (String)linkDoc.getPropertyValue("fvlink:url"));

			// If the link contains a file attachment, return the details
			BinaryBlob fileObj = (BinaryBlob)linkDoc.getProperty("file", "content");
			if(fileObj != null) {
				String filename = fileObj.getFilename();
				String mimeType = fileObj.getMimeType();
				// TODO: not sure how to retrieve this value from the object, so build it manually for now
				String binaryPath = "nxfile/default/" + linkDoc.getId() + "/file:content/" + filename;

				// Build JSON node
				linkJsonObj.put("uid", linkDoc.getId());
				linkJsonObj.put("name", filename);
				linkJsonObj.put("mime-type", mimeType);
				linkJsonObj.put("path", binaryPath);
			}
		} catch (DocumentNotFoundException de) {
    		log.warn("Could not retrieve link document.", de);
			return null;
		}

		return linkJsonObj;
	}


	/**
	 *	Retrieve the document title for a given id, and return a JSON object containing it.
	 */
	public static ObjectNode getDocumentIdAndTitleJsonObject(String documentId, CoreSession session) {

		IdRef ref = new IdRef(documentId);
		DocumentModel doc = null;
		ObjectNode jsonObj = mapper.createObjectNode();

		try {
			doc = session.getDocument(ref);
			// Build JSON node
			jsonObj.put("uid", doc.getId());
			jsonObj.put("dc:title", doc.getTitle());
		} catch (DocumentNotFoundException de) {
    		log.warn("Could not retrieve document.", de);
			return null;
		}

		return jsonObj;
	}

	/**
	 *	Return the part of speech label for a given part of speech id.
	 */
	public static String getPartOfSpeechLabel(String partOfSpeechId) {

		DirectoryService directoryService = Framework.getLocalService(DirectoryService.class);
		Session directorySession = directoryService.open("parts_of_speech");
		String partOfSpeechLabel = "";
		if (partOfSpeechId != null && !partOfSpeechId.isEmpty()) {
			// Create a query filter
			Map<String, Serializable> queryFilter = new HashMap<String, Serializable>();
			queryFilter.put("id", partOfSpeechId);

			// Execute the query, wrapped in a DocumentModel list
			DocumentModelList queryResult = directorySession.query(queryFilter);
			if(!queryResult.isEmpty()) {
				DocumentModel partOfSpeechDoc = queryResult.get(0);
				if (partOfSpeechDoc != null) {
					partOfSpeechLabel = partOfSpeechDoc.getProperty("xvocabulary:label").getValue(String.class);
				}
			}
		}
		directorySession.close();

		return partOfSpeechLabel;
	}
}
