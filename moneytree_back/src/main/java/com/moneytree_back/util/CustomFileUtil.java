package com.moneytree_back.util;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Component
@Log4j2
@RequiredArgsConstructor  // 실제 파일 저장 역할
public class CustomFileUtil { // 파일 데이터 입출력을 담당

    @Value("${moneytree_back.upload.path}")
    private String uploadPath;
    //파일을 저장할 디렉터리가 있는지 확인/없으면 생성
    @PostConstruct
    public void init() {
        File tempFolder = new File(uploadPath);

        if(tempFolder.exists() == false) {
            tempFolder.mkdir();
        }

        uploadPath = tempFolder.getAbsolutePath();
        log.info("업로드 경로: {}", uploadPath);

        log.info("-------------------------------------");
        log.info(uploadPath);
    }
    //업로드한 파일을 uuid값으로 업데이트한 후 저장
    public List<String> saveFiles(List<MultipartFile> files)throws RuntimeException{

        if(files == null || files.isEmpty()){
            return Collections.emptyList();
        }

        List<String> uploadNames = new ArrayList<>();

        for (MultipartFile multipartFile : files) {

            String savedName = UUID.randomUUID() + "_" + multipartFile.getOriginalFilename();

            Path savePath = Paths.get(uploadPath, savedName);

            try {
                Files.copy(multipartFile.getInputStream(), savePath);
                String contentType = multipartFile.getContentType();
                if(contentType != null && contentType.startsWith("image")){

                    String thumbnailName = "s_" + savedName;
                    Path thumbnailPath = Paths.get(uploadPath, thumbnailName);

                    Thumbnails.of(savePath.toFile())
                            .size(200, 200)
                            .toFile(thumbnailPath.toFile());
                }
                uploadNames.add(savedName);
            } catch (IOException e) {
                throw new RuntimeException(e.getMessage());
            }
        }//end for

        return uploadNames;
    }

    public ResponseEntity<Resource> getFile(String fileName){
        Resource resource = new FileSystemResource(uploadPath + File.separator + fileName);

        if( !resource.isReadable()){
            resource = new FileSystemResource(uploadPath + File.separator + "poster.jpg");
        }

        HttpHeaders headers = new HttpHeaders();

        try{
            headers.add("Content-Type", Files.probeContentType(resource.getFile().toPath()));
        }catch(IOException e){
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok().headers(headers).body(resource);
    }

    public void deleteFiles(List<String> fileNames){
        if(fileNames == null || fileNames.size() == 0){
            return;
        }
        fileNames.forEach(fileName ->{
            log.info("파일 삭제 시도: {}", fileName);

            // 썸네일이 있는지 확인하고 삭제
            String thumbnailFileName = "s_" + fileName;
            Path thumbnailPath = Paths.get(uploadPath, thumbnailFileName);
            Path filePath = Paths.get(uploadPath, fileName);
            try{// 경로(path)에 있는 파일이나 디렉터리를 삭제하는 기능을 제공
                boolean fileDeleted = Files.deleteIfExists(filePath);
                boolean thumbnailDeleted = Files.deleteIfExists(thumbnailPath);
                log.info("파일 삭제 여부: {} -> {}", fileName, fileDeleted);
                log.info("썸네일 삭제 여부: {} -> {}", "s_" + fileName, thumbnailDeleted);
            }catch(IOException e){
                throw new RuntimeException(e.getMessage());
            }
        });
    }

}