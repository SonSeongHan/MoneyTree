package controller;

import com.moneytree_back.dto.CommunityDTO;
import com.moneytree_back.service.CommunityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping
    public ResponseEntity<Page<CommunityDTO>> getPagedCommunities(
            @PageableDefault(page = 0, size = 10) Pageable pageable){

        Page<CommunityDTO> result = communityService.getPagedAllCommunity(pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityDTO> getCommunityById(@PathVariable Long id){
        CommunityDTO result = communityService.getCommunityById(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<CommunityDTO> saveCommunity(@RequestBody CommunityDTO communityDTO){
        communityService.saveCommunity(communityDTO);
        return ResponseEntity.status(201).body(communityDTO);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<CommunityDTO> updateCommunity(
            @PathVariable Long id,
            @RequestBody CommunityDTO communityDTO){
        communityDTO.setId(id);
        communityService.updateCommunity(communityDTO);
        return ResponseEntity.ok(communityDTO);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteCommunity(@PathVariable Long id){
        communityService.deleteCommunity(id);
    }



}
