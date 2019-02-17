package ca.firstvoices.nuxeo.enrichers;

import static org.nuxeo.ecm.core.io.registry.reflect.Instantiations.SINGLETON;
import static org.nuxeo.ecm.core.io.registry.reflect.Priorities.REFERENCE;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.io.marshallers.json.enrichers.AbstractJsonEnricher;
import org.nuxeo.ecm.core.io.registry.reflect.Setup;

import ca.firstvoices.nuxeo.utils.EnricherUtils;

@Setup(mode = SINGLETON, priority = REFERENCE)
public class GalleryEnricher extends AbstractJsonEnricher<DocumentModel> {

    public static final String NAME = "gallery";

    public GalleryEnricher() {
        super(NAME);
    }

    // Method that will be called when the enricher is asked for
    @Override
    public void write(JsonGenerator jg, DocumentModel doc) throws IOException {
        // We use the Jackson library to generate Json
        ObjectNode galleryJsonObject = constructGalleryJSON(doc);
        jg.writeFieldName(NAME);
        jg.writeObject(galleryJsonObject);
    }

    private ObjectNode constructGalleryJSON(DocumentModel doc) {
        ObjectMapper mapper = new ObjectMapper();

        // JSON object to be returned
        ObjectNode jsonObj = mapper.createObjectNode();

        // First create the parent document's Json object content
        CoreSession session = doc.getCoreSession();

        String documentType = doc.getType();

        if (documentType.equalsIgnoreCase("FVGallery")) {

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
        }

        return jsonObj;
    }
}