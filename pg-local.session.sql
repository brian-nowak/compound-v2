select * from transactions_enriched 
where upper(transaction_name) like '%DATABRICKS%' 
limit 5