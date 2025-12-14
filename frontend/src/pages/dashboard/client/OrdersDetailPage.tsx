import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  PaymentHistory,
  EstimationList,
  EstimationViewer,
  InvoiceList,
  InvoiceViewer,
  TaskManager,
  StatusTimeline
} from '../../../components';
import { getWorkflowInfo } from '../../../api/workflow';
import type { WorkflowInfo } from '../../../types/workflow';
import type { Estimation } from '../../../types/estimations';
import type { Invoice } from '../../../types/invoices';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [workflowInfo, setWorkflowInfo] = useState<WorkflowInfo | null>(null);
  const [selectedEstimation, setSelectedEstimation] = useState<Estimation | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  useEffect(() => {
    if (orderId) {
      fetchWorkflowInfo();
    }
  }, [orderId]);
  const fetchWorkflowInfo = async () => {
    try {
      const response = await getWorkflowInfo(parseInt(orderId!));
      setWorkflowInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch workflow info:', error);
    }
  };
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="estimations">Estimations</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {/* Your existing order overview content */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Overview</h2>
            {/* Add your existing order details here */}
          </div>
        </TabsContent>
        <TabsContent value="payments">
          <PaymentHistory orderId={parseInt(orderId!)} />
        </TabsContent>
        <TabsContent value="estimations">
          {selectedEstimation ? (
            <div>
              <button 
                onClick={() => setSelectedEstimation(null)}
                className="mb-4 text-blue-600 hover:text-blue-700"
              >
                ← Back to list
              </button>
              <EstimationViewer 
                estimation={selectedEstimation}
                isClient={true}
              />
            </div>
          ) : (
            <EstimationList
              orderId={parseInt(orderId!)}
              onEstimationClick={(est) => setSelectedEstimation(est)}
            />
          )}
        </TabsContent>
        <TabsContent value="invoices">
          {selectedInvoice ? (
            <div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="mb-4 text-blue-600 hover:text-blue-700"
              >
                ← Back to list
              </button>
              <InvoiceViewer invoice={selectedInvoice} />
            </div>
          ) : (
            <InvoiceList
              orderId={parseInt(orderId!)}
              onInvoiceClick={(inv) => setSelectedInvoice(inv)}
            />
          )}
        </TabsContent>
        <TabsContent value="tasks">
          <TaskManager 
            orderId={parseInt(orderId!)}
            canEdit={false}
          />
        </TabsContent>
        <TabsContent value="progress">
          {workflowInfo && (
            <StatusTimeline workflowInfo={workflowInfo} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}