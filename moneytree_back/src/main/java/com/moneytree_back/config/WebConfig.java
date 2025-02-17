package com.moneytree_back.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;

/**
 * WebConfig 클래스는 정적 리소스(예: 업로드된 파일)에 대한 경로를 설정합니다.
 * 여기서는 application.properties에서 설정한 업로드 경로(uploadPath)를 기반으로
 * 서버의 정적 리소스로 파일을 제공할 수 있도록 ResourceHandler를 등록합니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

  // application.properties의 moneytree_back.upload.path 값을 주입받음 (예: uploads)
  @Value("${moneytree_back.upload.path}")
  private String uploadPath;

  /**
   * addResourceHandlers 메서드는 URL 경로에 대한 정적 리소스 위치를 매핑합니다.
   * 예를 들어, URL이 http://localhost:8080/uploads/filename.ext 로 시작하면,
   * 실제 파일은 프로젝트의 [user.dir]/uploads/filename.ext 에 위치하도록 설정합니다.
   *
   * @param registry ResourceHandlerRegistry 객체
   */
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // 현재 프로젝트의 절대 경로 + 업로드 폴더 경로를 구성합니다.
    String absolutePath = "file:" + System.getProperty("user.dir")
      + File.separator + uploadPath + File.separator;
    System.out.println("정적 리소스 경로: " + absolutePath);
    // URL 패턴 /uploads/** 에 대해 해당 절대 경로의 리소스를 제공하도록 매핑합니다.
    registry.addResourceHandler("/" + uploadPath + "/**")
      .addResourceLocations(absolutePath);
  }
}
