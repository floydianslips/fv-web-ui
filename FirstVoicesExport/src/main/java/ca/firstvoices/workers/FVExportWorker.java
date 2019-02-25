package ca.firstvoices.workers;

import static ca.firstvoices.utils.FVExportConstants.FVWORD;
import static ca.firstvoices.utils.FVExportConstants.ON_DEMAND_WORKER_CATEGORY;

import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.core.api.DocumentLocation;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.IdRef;

import ca.firstvoices.format_producers.FV_AbstractProducer;
import ca.firstvoices.format_producers.FV_PhraseCSVProducer;
import ca.firstvoices.format_producers.FV_WordCSVProducer;
import ca.firstvoices.property_readers.FV_DataBinding;

/*
        Worker description is in FVAbstractExportWorker file.

        FVExportWorker starts export for words and phrases
*/

public class FVExportWorker extends FVAbstractExportWork {
    private static final Log log = LogFactory.getLog(FVExportWorker.class);

    @Override
    public String getCategory() {
        return ON_DEMAND_WORKER_CATEGORY;
    }

    @Override
    public String getTitle() {
        return "Produce formatted document when triggered by user.";
    }

    public FVExportWorker(String id) {
        super(id);
    }

    @Override
    public void work() {
        if (!getDocuments().isEmpty()) {
            openSystemSession();

            List listToProcess = getDocuments();

            FV_AbstractProducer fileOutputProducer;

            if (workInfo.exportElement.equals(FVWORD)) {
                fileOutputProducer = new FV_WordCSVProducer(session, workInfo.fileName, workInfo.columns);
            } else {
                fileOutputProducer = new FV_PhraseCSVProducer(session, workInfo.fileName, workInfo.columns);
            }

            fileOutputProducer.writeColumnNames();

            int size = listToProcess.size();
            double originalSize = size;
            int counter = 1;

            workInfo.setExportProgress("Exporting... " + size + " words.");

            while (!listToProcess.isEmpty()) {
                size = listToProcess.size();

                if (counter % 51 == 0) {
                    counter = 0;
                    double currentSize = size;
                    double percent = round(100 * (1 - (currentSize / originalSize)), 1);
                    workInfo.setExportProgressValue(percent);
                    workInfo.setExportProgress(percent + "% done.");
                }

                DocumentLocation docLocation = (DocumentLocation) listToProcess.get(size - 1);
                listToProcess.remove(size - 1);

                if (docLocation != null) {
                    DocumentModel doc = session.getDocument(docLocation.getIdRef());

                    if (doc != null) {
                        List<FV_DataBinding> output = fileOutputProducer.readPropertiesWithReadersFrom(doc);

                        assert (output != null) : "Null output from producer";

                        if (output != null) {
                            fileOutputProducer.writeRowData(output);
                            counter++;
                        }
                    }
                } else {
                    log.warn("NUll docLocation in FVExportWorker.");
                }
            }

            fileOutputProducer.close(session.getDocument(new IdRef(getDialectGUID())), getWorkInfo());
        }

    }
}
