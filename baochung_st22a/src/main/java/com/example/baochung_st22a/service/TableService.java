package com.example.baochung_st22a.service;

import com.example.baochung_st22a.model.CafeTable;
import com.example.baochung_st22a.model.TableOrderItem;

import java.util.List;

public interface TableService {

    List<CafeTable> getAllTables();

    CafeTable getTableById(Integer id);

    CafeTable saveTable(CafeTable table);

    CafeTable updateTable(Integer id, CafeTable newTable);

    boolean deleteTable(Integer id);

    boolean updateTableStatus(Integer id, String status);

    List<CafeTable> getAvailableTables();

    CafeTable addItemToTable(Integer tableId, TableOrderItem item);

    boolean removeItemFromTable(Integer tableId, Integer itemId);

    void resetTableAfterPayment(Integer id);
}
