package ca.firstvoices.nuxeo.enrichers;

import static org.nuxeo.ecm.core.io.registry.reflect.Instantiations.SINGLETON;
import static org.nuxeo.ecm.core.io.registry.reflect.Priorities.REFERENCE;

import java.io.IOException;

import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.io.marshallers.json.enrichers.AbstractJsonEnricher;
import org.nuxeo.ecm.core.io.registry.reflect.Setup;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import ca.firstvoices.nuxeo.utils.EnricherUtils;

@Setup(mode = SINGLETON, priority = REFERENCE)
public class BookEnricher extends AbstractJsonEnricher<DocumentModel> {

    public static final String NAME = "book";

    public BookEnricher() {
        super(NAME);
    }

    // Method that will be called when the enricher is asked for
    @Override
    public void write(JsonGenerator jg, DocumentModel doc) throws IOException {
        // We use the Jackson library to generate Json
        ObjectNode bookJsonObject = constructBookJSON(doc);
        jg.writeFieldName(NAME);
        jg.writeObject(bookJsonObject);
    }

    private ObjectNode constructBookJSON(DocumentModel doc)
            throws JsonGenerationException, JsonMappingException, IOException {
        ObjectMapper mapper = new ObjectMapper();

        // JSON object to be returned
        ObjectNode jsonObj = mapper.createObjectNode();

        // First create the parent document's Json object content
        CoreSession session = doc.getCoreSession();

        String documentType = doc.getType();

        /*
         * Properties for FVBook / FVBookEntry
         */
        if (documentType.equalsIgnoreCase("FVBook") || documentType.equalsIgnoreCase("FVBookEntry")) {

            if (documentType.equalsIgnoreCase("FVBook")) {
                // Process "fvcore:source" values
                String[] sourceIds = (!doc.isProxy()) ? (String[]) doc.getProperty("fvcore", "source")
                        : (String[]) doc.getProperty("fvproxy", "proxied_source");
                if (sourceIds != null) {
                    ArrayNode sourceArray = mapper.createArrayNode();
                    for (String sourceId : sourceIds) {
                        ObjectNode sourceObj = EnricherUtils.getDocumentIdAndTitleAndPathJsonObject(sourceId, session);
                        if (sourceObj != null) {
                            sourceArray.add(sourceObj);
                        }
                    }
                    jsonObj.set("sources", sourceArray);
                }

                // Process "fv-book:author" values
                String[] authorIds = (!doc.isProxy()) ? (String[]) doc.getProperty("fvbook", "author")
                        : (String[]) doc.getProperty("fvproxy", "proxied_author");
                if (authorIds != null) {
                    ArrayNode authorArray = mapper.createArrayNode();
                    for (String authorId : authorIds) {
                        ObjectNode authorObj = EnricherUtils.getDocumentIdAndTitleAndPathJsonObject(authorId, session);
                        if (authorObj != null) {
                            authorArray.add(authorObj);
                        }
                    }
                    jsonObj.set("authors", authorArray);
                }
            }

            // Process "fv:related_audio" values
            String[] audioIds = (!doc.isProxy()) ? (String[]) doc.getProperty("fvcore", "related_audio")
                    : (String[]) doc.getProperty("fvproxy", "proxied_audio");
            if (audioIds != null) {
                ArrayNode audioJsonArray = mapper.createArrayNode();
                for (String audioId : audioIds) {
                    ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(audioId, session);
                    if (binaryJsonObj != null) {
                        audioJsonArray.add(binaryJsonObj);
                    }
                }
                jsonObj.set("related_audio", audioJsonArray);
            }

            // Process "fv:related_pictures" values
            String[] pictureIds = (!doc.isProxy()) ? (String[]) doc.getProperty("fvcore", "related_pictures")
                    : (String[]) doc.getProperty("fvproxy", "proxied_pictures");
            if (pictureIds != null) {
                ArrayNode pictureJsonArray = mapper.createArrayNode();
                for (String pictureId : pictureIds) {
                    ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(pictureId, session);
                    if (binaryJsonObj != null) {
                        pictureJsonArray.add(binaryJsonObj);
                    }
                }
                jsonObj.set("related_pictures", pictureJsonArray);
            }

            // Process "fv:related_video" values
            String[] videoIds = (!doc.isProxy()) ? (String[]) doc.getProperty("fvcore", "related_videos")
                    : (String[]) doc.getProperty("fvproxy", "proxied_videos");
            if (videoIds != null) {
                ArrayNode videoJsonArray = mapper.createArrayNode();
                for (String videoId : videoIds) {
                    ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(videoId, session);
                    if (binaryJsonObj != null) {
                        videoJsonArray.add(binaryJsonObj);
                    }
                }
                jsonObj.set("related_videos", videoJsonArray);
            }
        }

        return jsonObj;
    }
}
