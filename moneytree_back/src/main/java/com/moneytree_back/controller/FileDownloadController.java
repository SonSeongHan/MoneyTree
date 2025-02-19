package com.moneytree_back.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

@RestController
@RequestMapping("/api/download")
public class FileDownloadController {

  @Value("${moneytree_back.upload.path}")
  private String uploadPath; // 예: uploads

  @GetMapping("/{fileName:.+}")
  public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
    String absolutePath = System.getProperty("user.dir") + File.separator + uploadPath + File.separator + fileName;
    File file = new File(absolutePath);
    if (!file.exists()) {
      return ResponseEntity.notFound().build();
    }
    Resource resource = new FileSystemResource(file);
    HttpHeaders headers = new HttpHeaders();
    headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
    return ResponseEntity.ok()
      .headers(headers)
      .body(resource);
  }
}
