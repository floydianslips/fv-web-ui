package ca.firstvoices.property_readers;

import java.util.ArrayList;
import java.util.List;

import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.IdRef;
import org.nuxeo.ecm.core.api.NuxeoException;

import ca.firstvoices.format_producers.FV_AbstractProducer;
import ca.firstvoices.utils.ExportColumnRecord;

public class FV_CategoryPropertyReader extends FV_AbstractPropertyReader {
    public FV_CategoryPropertyReader(CoreSession session, ExportColumnRecord spec, FV_AbstractProducer specOwner) {
        super(session, spec, specOwner);
    }

    @Override
    public ReaderType readerType() {
        return ReaderType.CATEGORY;
    }

    @Override
    public List<FV_DataBinding> readPropertyFromObject(Object o) {
        DocumentModel word = (DocumentModel) o;
        List<FV_DataBinding> readValues = new ArrayList<>();
        Object[] categoryIds = (Object[]) word.getPropertyValue(propertyToRead);
        Object[] colA = columns.toArray();
        // StringList categories = new StringList();

        int colCounter = 0;

        for (Object categoryId : categoryIds) {
            if (categoryId == null) {
                log.warn("Null Category in FV_CategoryPropertyReader");
                readValues.add(new FV_DataBinding((String) colA[colCounter], ""));
                colCounter++;
                continue;
            }

            if (!(categoryId instanceof String))
                throw new NuxeoException("Wrong GUID type for category");

            DocumentModel categoryDoc = session.getDocument(new IdRef((String) categoryId));

            readValues.add(new FV_DataBinding((String) colA[colCounter], categoryDoc.getTitle()));
            colCounter++;
            log.warn("Null category document in FV_CategoryPropertyReader.");
            readValues.add(new FV_DataBinding((String) colA[colCounter], "Null category document"));
            colCounter++;
        }

        for (; colCounter < maxColumns; colCounter++) {
            readValues.add(new FV_DataBinding((String) colA[colCounter], ""));
        }

        return readValues;
    }

}
