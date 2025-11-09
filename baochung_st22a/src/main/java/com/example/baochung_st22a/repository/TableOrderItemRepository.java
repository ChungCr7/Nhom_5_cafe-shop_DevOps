package com.example.baochung_st22a.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.baochung_st22a.model.TableOrderItem;

@Repository
public interface TableOrderItemRepository extends JpaRepository<TableOrderItem, Integer> {
}
